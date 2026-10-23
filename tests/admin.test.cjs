const { test, beforeEach, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const mongoose = require('mongoose');
const ejs = require('ejs');
const ProductModel = require('../src/schema/Product.model').default;
const MemberModel = require('../src/schema/Member.model').default;
const ProductService = require('../src/model/Product.service').default;
const productController = require('../src/controller/product.controller').default;
const restaurantController = require('../src/controller/restaurant.controller').default;
const Errors = require('../src/libs/Errors').default;

const ID = '507f1f77bcf86cd799439011';
const base = { _id: ID, productName: 'Soup', productCollection: 'DISH', productPrice: 10, productCount: 4 };
const service = new ProductService();
const query = value => ({ async exec() { return value; } });
const expectCode = code => error => error instanceof Errors && error.code === code;
const document = fields => new ProductModel({ ...base, ...fields });

function response() {
    return {
        statusCode: 200,
        status(code) { this.statusCode = code; return this; },
        json(body) { this.body = JSON.parse(JSON.stringify(body)); return this; },
        send(body) { this.body = body; return this; },
    };
}

beforeEach(t => {
    for (const model of [ProductModel, MemberModel]) {
        for (const method of ['create', 'findOneAndUpdate', 'find']) {
            t.mock.method(model, method, () => { throw new Error(`Unexpected model call: ${method}`); });
        }
    }
    t.mock.method(mongoose, 'connect', () => { throw new Error('Database access forbidden'); });
    t.mock.method(console, 'log', () => {});
});

after(() => {
    assert.equal(mongoose.connection.readyState, 0);
    assert.equal(require.cache[require.resolve('../src/app.ts')], undefined);
    assert.equal(require.cache[require.resolve('../src/server.ts')], undefined);
});

test('creation maps both inventory request names to the existing database field', async t => {
    for (const counts of [{ productCount: 0 }, { productLeftCount: '12' }, { productCount: 2, productLeftCount: '2' }]) {
        t.mock.method(ProductModel, 'create', async payload => {
            assert.equal(Object.hasOwn(payload, 'productLeftCount'), false);
            assert.equal(payload.productCount, Number(counts.productCount ?? counts.productLeftCount));
            const result = document(payload);
            await result.validate();
            return result;
        });
        const { productCount, ...fields } = base;
        const result = await service.createNewProduct({ ...fields, ...counts });
        assert.equal(result.productCount, Number(counts.productCount ?? counts.productLeftCount));
    }
});

test('the product creation controller accepts canonical and legacy inventory without overwriting either', async t => {
    t.mock.method(ProductModel, 'create', async payload => {
        assert.deepEqual(payload.productImages, ['uploads/products/soup.png']);
        const result = document(payload);
        await result.validate();
        return result;
    });
    for (const counts of [{ productCount: 3 }, { productLeftCount: '5' }]) {
        const { productCount, ...fields } = base;
        const res = response();
        await productController.createNewProduct({ body: { ...fields, ...counts }, files: [{ path: 'uploads/products/soup.png' }] }, res);
        assert.match(res.body, /Product Successfully created/);
        assert.match(res.body, /\/admin\/product\/all/);
    }
});

test('inventory updates write only canonical productCount, including zero', async t => {
    for (const counts of [{ productCount: 0 }, { productLeftCount: '7' }, { productCount: '3', productLeftCount: 3 }]) {
        t.mock.method(ProductModel, 'findOneAndUpdate', (filter, update, options) => {
            assert.equal(filter._id.toHexString(), ID);
            assert.deepEqual(update, { $set: { productCount: Number(counts.productCount ?? counts.productLeftCount) } });
            assert.deepEqual(options, { new: true, runValidators: true });
            return query(document(update.$set));
        });
        const result = await service.updateProduct(ID, counts);
        assert.equal(result.productCount, Number(counts.productCount ?? counts.productLeftCount));
    }
});

test('invalid or conflicting inventory is rejected before writes', async () => {
    for (const value of ['', ' ', null, true, {}, [], -1, '-1', 1.5, '1.5', Infinity, 'Infinity', NaN, Number.MAX_SAFE_INTEGER + 1]) {
        for (const field of ['productCount', 'productLeftCount']) {
            await assert.rejects(service.updateProduct(ID, { [field]: value }), expectCode(400));
            await assert.rejects(service.createNewProduct({ ...base, [field]: value }), expectCode(400));
        }
    }
    await assert.rejects(service.updateProduct(ID, { productCount: 2, productLeftCount: 3 }), expectCode(400));
    await assert.rejects(service.createNewProduct({ ...base, productLeftCount: 3 }), expectCode(400));
    const { productCount, ...missingCount } = base;
    await assert.rejects(service.createNewProduct(missingCount), expectCode(400));
    assert.equal(ProductModel.create.mock.callCount(), 0);
    assert.equal(ProductModel.findOneAndUpdate.mock.callCount(), 0);
});

for (const [input, stored] of [['PAUSE', 'PAUSE'], ['PROSSESS', 'PROSSESS'], ['PROCESS', 'PROSSESS'], ['DELETED', 'DELETED'], ['DELETE', 'DELETED']]) {
    test(`creation and updates persist status ${input} as ${stored}`, async t => {
        t.mock.method(ProductModel, 'create', async payload => {
            assert.equal(payload.productStatus, stored);
            const result = document(payload);
            await result.validate();
            return result;
        });
        t.mock.method(ProductModel, 'findOneAndUpdate', (filter, update) => {
            assert.deepEqual(update, { $set: { productStatus: stored } });
            return query(document(update.$set));
        });
        await service.createNewProduct({ ...base, productStatus: input });
        const result = await service.updateProduct(ID, { productStatus: input });
        assert.equal(result.productStatus, stored);
        assert.equal(result.productCount, base.productCount);
    });
}

test('malformed product requests, statuses, and IDs return validation errors before database queries', async () => {
    for (const input of [null, [], {}, { productStatus: 'INVALID' }, { productStatus: {} }, { $set: { productCount: -1 } }]) {
        await assert.rejects(service.updateProduct(ID, input), expectCode(400));
    }
    for (const id of [undefined, null, '', 'abcdefghijkl', {}, [ID]]) {
        await assert.rejects(service.updateProduct(id, { productStatus: 'PAUSE' }), expectCode(400));
    }
    assert.equal(ProductModel.findOneAndUpdate.mock.callCount(), 0);
});

test('updates cannot pass arbitrary MongoDB operators or identity changes through to the database', async t => {
    t.mock.method(ProductModel, 'findOneAndUpdate', (filter, update) => {
        assert.equal(filter._id.toHexString(), ID);
        assert.deepEqual(update, { $set: { productCount: 4 } });
        return query(document());
    });
    await service.updateProduct(ID, { productCount: 4, _id: 'another-id', $inc: { productCount: -10 }, unexpected: true });
});

test('product update responses retain the data wrapper and report missing products as 404', async t => {
    t.mock.method(ProductModel, 'findOneAndUpdate', () => query(document({ productStatus: 'PROSSESS' })));
    const res = response();
    await productController.updateProduct({ params: { id: ID }, body: { productStatus: 'PROCESS' } }, res);
    assert.equal(res.statusCode, 200);
    assert.deepEqual(Object.keys(res.body), ['data']);
    assert.equal(res.body.data.productStatus, 'PROSSESS');
    t.mock.method(ProductModel, 'findOneAndUpdate', () => query(null));
    const missing = response();
    await productController.updateProduct({ params: { id: ID }, body: { productStatus: 'PAUSE' } }, missing);
    assert.equal(missing.statusCode, 404);
    assert.equal(missing.body.code, 404);
});

test('schema validation failures return 400 and infrastructure failures retain generic 500 responses', async t => {
    t.mock.method(ProductModel, 'findOneAndUpdate', (filter, update) => ({ async exec() {
        const result = document(update.$set);
        await result.validate();
        return result;
    } }));
    const invalid = response();
    await productController.updateProduct({ params: { id: ID }, body: { productCollection: 'INVALID' } }, invalid);
    assert.equal(invalid.statusCode, 400);
    assert.equal(invalid.body.code, 400);
    t.mock.method(ProductModel, 'findOneAndUpdate', () => { throw new Error('Private database failure'); });
    const failure = response();
    await productController.updateProduct({ params: { id: ID }, body: { productStatus: 'PAUSE' } }, failure);
    assert.equal(failure.statusCode, 500);
    assert.equal(JSON.stringify(failure.body).includes('Private database failure'), false);
});

test('rendered status controls submit schema values and select both canonical and legacy records correctly', async () => {
    for (const [status, selected] of [['PAUSE', 'PAUSE'], ['PROSSESS', 'PROSSESS'], ['PROCESS', 'PROSSESS'], ['DELETED', 'DELETED'], ['DELETE', 'DELETED']]) {
        const html = await ejs.renderFile(path.join(__dirname, '../src/views/products.ejs'), { data: [document({ productStatus: status })] });
        const control = html.match(/<select class="spec-select new-product-status"[\s\S]*?<\/select>/)[0];
        assert.match(control, new RegExp(`value="${selected}"\\s+selected`));
        assert.equal((control.match(/\bselected\b/g) || []).length, 1);
        assert.equal(control.includes('value="PROCESS"'), false);
        assert.equal(control.includes('value="DELETE"'), false);
        assert.match(html, /name="productLeftCount"/);
    }
});

function browserScript(filename, value, axios) {
    const handlers = new Map();
    const alerts = [];
    let blurred = false;
    const $ = selector => {
        if (typeof selector === 'function') { selector(); return; }
        return {
            on(event, callback) { handlers.set(`${selector}:${event}`, callback); },
            val() { return value; },
            blur() { blurred = true; },
        };
    };
    vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../src/public/js', filename), 'utf8'), {
        $, axios, alert: message => alerts.push(message), console: { log() {} },
    });
    return { handlers, alerts, blurred: () => blurred };
}

test('the user-status browser handler recognizes the actual controller success response', async t => {
    t.mock.method(MemberModel, 'findOneAndUpdate', () => query(new MemberModel({
        _id: ID, memberNick: 'user', memberPhone: '01012345678', memberPassword: 'not-returned', memberStatus: 'BLOCK',
    })));
    const browser = browserScript('users.js', 'BLOCK', {
        async post(url, body) {
            assert.equal(url, '/admin/user/edit');
            assert.deepEqual(JSON.parse(JSON.stringify(body)), { _id: ID, memberStatus: 'BLOCK' });
            const res = response();
            await restaurantController.updateUser({ body }, res);
            assert.equal(res.statusCode, 200);
            return { data: res.body };
        },
    });
    browser.handlers.get('.member-status:change')({ target: { id: ID } });
    await new Promise(setImmediate);
    assert.deepEqual(browser.alerts, ['User updated successfully']);
    assert.equal(browser.blurred(), true);
});

test('the product-status browser handler remains compatible with the actual update response', async t => {
    t.mock.method(ProductModel, 'findOneAndUpdate', () => query(document({ productStatus: 'PROSSESS' })));
    const browser = browserScript('products.js', 'PROSSESS', {
        async post(url, body) {
            assert.equal(url, `/admin/product/${ID}`);
            const res = response();
            await productController.updateProduct({ params: { id: ID }, body }, res);
            assert.equal(res.statusCode, 200);
            return { data: res.body };
        },
    });
    await browser.handlers.get('.new-product-status:change')({ target: { id: ID } });
    assert.deepEqual(browser.alerts, []);
    assert.equal(browser.blurred(), true);
});
