const { test, beforeEach, after } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const MemberModel = require('../src/schema/Member.model').default;
const MemberService = require('../src/model/Member.service').default;
const restaurant = require('../src/controller/restaurant.controller').default;
const memberController = require('../src/controller/memeber.controller').default;
const Errors = require('../src/libs/Errors').default;
const { Message } = require('../src/libs/Errors');

const ID = '507f1f77bcf86cd799439011';
const PASSWORD = 'regression-password';
const HASH = bcrypt.hashSync(PASSWORD, 4);
const credentials = { memberNick: 'restaurant', memberPassword: PASSWORD };
const signup = { ...credentials, memberPhone: '01012345678' };
const service = new MemberService();

function document(overrides = {}) {
    return new MemberModel({
        _id: ID, ...signup, memberPassword: HASH,
        memberType: 'RESTAURANT', memberStatus: 'ACTIVE', ...overrides,
    });
}

function query(value) {
    return { select() { return this; }, async exec() { return value; } };
}

function response() {
    return {
        statusCode: 200, locals: {},
        status(code) { this.statusCode = code; return this; },
        json(body) { this.body = JSON.parse(JSON.stringify(body)); this.kind = 'json'; return this; },
        send(body) { this.body = body; this.kind = 'send'; return this; },
        redirect(path) { this.location = path; this.kind = 'redirect'; return this; },
        type(type) { this.contentType = type; return this; },
        clearCookie(name) { this.clearedCookie = name; return this; },
    };
}

function request(body = {}, failures = {}) {
    const events = [];
    const req = { body, events, sessionID: 'old-session' };
    const methods = {
        regenerate(callback) {
            events.push('regenerate');
            queueMicrotask(() => {
                if (!failures.regenerate) {
                    req.sessionID = 'new-session';
                    req.session = { ...methods };
                }
                callback(failures.regenerate);
            });
        },
        save(callback) {
            events.push('save');
            queueMicrotask(() => callback(failures.save));
        },
        destroy(callback) {
            events.push('destroy');
            queueMicrotask(() => {
                if (!failures.destroy) req.session = undefined;
                callback(failures.destroy);
            });
        },
    };
    req.session = { ...methods, member: document().toObject() };
    return req;
}

function expectCode(code) {
    return error => error instanceof Errors && error.code === code;
}

beforeEach(t => {
    // Unexpected model/network access fails immediately; no app or .env is loaded.
    for (const method of ['create', 'findOne', 'findById', 'find', 'findOneAndUpdate']) {
        t.mock.method(MemberModel, method, () => { throw new Error(`Unexpected model operation: ${method}`); });
    }
    t.mock.method(mongoose, 'connect', () => { throw new Error('Database connections forbidden in tests'); });
    t.mock.method(console, 'error', () => {});
});

after(() => {
    assert.equal(mongoose.connection.readyState, 0);
    assert.equal(require.cache[require.resolve('../src/app.ts')], undefined);
    assert.equal(require.cache[require.resolve('../src/server.ts')], undefined);
});

test('public signup ignores privileged fields, hashes passwords, and preserves its response shape', async t => {
    let stored;
    t.mock.method(MemberModel, 'create', async input => {
        stored = { ...input };
        return document(input);
    });
    const input = {
        ...signup, memberType: 'RESTAURANT', memberStatus: 'BLOCK', memberPoints: 999,
        memberAddress: 'Seoul', memberDesc: '', memberImage: 'avatar.png', _id: 'injected',
    };
    const result = await service.signup(input);
    assert.equal(stored.memberType, 'USER');
    assert.equal(stored.memberStatus, 'ACTIVE');
    assert.equal(stored.memberPoints, 0);
    assert.equal(stored._id, undefined);
    assert.equal(stored.memberAddress, 'Seoul');
    assert.equal(await bcrypt.compare(PASSWORD, stored.memberPassword), true);
    assert.notEqual(stored.memberPassword, PASSWORD);
    assert.equal(input.memberPassword, PASSWORD);
    assert.equal(result.memberPassword, '');
    assert.equal(JSON.stringify(result).includes(stored.memberPassword), false);
});

test('admin signup sets trusted fields and excludes the stored hash', async t => {
    t.mock.method(MemberModel, 'findOne', filter => {
        assert.deepEqual(filter, { memberType: 'RESTAURANT' });
        return query(null);
    });
    let stored;
    t.mock.method(MemberModel, 'create', async input => {
        stored = input;
        return document(input);
    });
    const result = await service.processSignup({
        ...signup, memberType: 'USER', memberStatus: 'DELETED', memberPoints: 999,
        memberImage: 'uploads/member/image.png',
    });
    assert.equal(stored.memberType, 'RESTAURANT');
    assert.equal(stored.memberStatus, 'ACTIVE');
    assert.equal(stored.memberPoints, 0);
    assert.equal(await bcrypt.compare(PASSWORD, stored.memberPassword), true);
    assert.equal(Object.hasOwn(result, 'memberPassword'), false);
});

test('admin signup preserves the existing single-restaurant check', async t => {
    t.mock.method(MemberModel, 'findOne', () => query(document()));
    await assert.rejects(service.processSignup(signup), expectCode(400));
    assert.equal(MemberModel.create.mock.callCount(), 0);
});

test('malformed credentials are rejected before queries and password hashing', async t => {
    t.mock.method(bcrypt, 'genSalt', () => { throw new Error('Hashing must not run'); });
    const invalid = [undefined, null, [], 'body', {},
        { memberNick: { $ne: null }, memberPassword: PASSWORD },
        { memberNick: 'restaurant', memberPassword: [] },
        { memberNick: '', memberPassword: PASSWORD },
        { memberNick: 'restaurant', memberPassword: '  ' }];
    for (const input of invalid) {
        for (const method of ['signup', 'processSignup', 'login', 'processLogin']) {
            await assert.rejects(service[method](input), expectCode(400));
        }
    }
    assert.equal(MemberModel.findOne.mock.callCount(), 0);
    assert.equal(MemberModel.create.mock.callCount(), 0);
    assert.equal(bcrypt.genSalt.mock.callCount(), 0);
});

test('signup validates phone and optional profile fields before database access', async () => {
    for (const method of ['signup', 'processSignup']) {
        for (const memberPhone of [undefined, '', ' ', 123, {}]) {
            await assert.rejects(service[method]({ ...signup, memberPhone }), expectCode(400));
        }
        for (const field of ['memberAddress', 'memberDesc', 'memberImage']) {
            for (const value of [null, 123, [], {}]) {
                await assert.rejects(service[method]({ ...signup, [field]: value }), expectCode(400));
            }
        }
    }
    assert.equal(MemberModel.findOne.mock.callCount(), 0);
});

test('valid public login returns member data without a password or additional lookup', async t => {
    t.mock.method(MemberModel, 'findOne', filter => {
        assert.deepEqual(filter, { memberNick: credentials.memberNick, memberStatus: { $ne: 'DELETED' } });
        return query(document({ memberType: 'USER' }));
    });
    const result = await service.login(credentials);
    assert.equal(result.memberType, 'USER');
    assert.equal(Object.hasOwn(result, 'memberPassword'), false);
    assert.equal(MemberModel.findById.mock.callCount(), 0);
});

for (const [label, member, password, code] of [
    ['ordinary user', document({ memberType: 'USER' }), PASSWORD, 403],
    ['blocked restaurant', document({ memberStatus: 'BLOCK' }), PASSWORD, 403],
    ['deleted restaurant', document({ memberStatus: 'DELETED' }), PASSWORD, 404],
    ['missing account', null, PASSWORD, 404],
    ['invalid password', document(), 'wrong-password', 401],
]) {
    test(`admin login rejects ${label} without establishing a session`, async t => {
        t.mock.method(MemberModel, 'findOne', () => query(member));
        await assert.rejects(service.processLogin({ ...credentials, memberPassword: password }), expectCode(code));
        const req = request({ ...credentials, memberPassword: password });
        delete req.session.member;
        const res = response();
        await restaurant.processLogin(req, res);
        assert.equal(req.session.member, undefined);
        assert.deepEqual(req.events, []);
        assert.match(res.body, /\/admin\/login/);
        assert.equal(res.location, undefined);
    });
}

test('successful admin login regenerates and saves a sanitized session before redirect', async t => {
    t.mock.method(MemberModel, 'findOne', () => query(document()));
    const req = request(credentials);
    const res = response();
    const pending = restaurant.processLogin(req, res);
    assert.equal(res.location, undefined);
    await pending;
    assert.deepEqual(req.events, ['regenerate', 'save']);
    assert.equal(req.sessionID, 'new-session');
    assert.equal(req.session.member.memberType, 'RESTAURANT');
    assert.equal(Object.hasOwn(req.session.member, 'memberPassword'), false);
    assert.equal(res.location, '/admin/product/all');
});

for (const step of ['regenerate', 'save']) {
    test(`admin login handles ${step} failure without leaving an authenticated member`, async t => {
        t.mock.method(MemberModel, 'findOne', () => query(document()));
        const req = request(credentials, { [step]: new Error(`${PASSWORD} ${HASH}`) });
        const res = response();
        await restaurant.processLogin(req, res);
        assert.equal(req.session.member, undefined);
        assert.equal(res.location, undefined);
        assert.match(res.body, /Something went wrong/);
        assert.equal(res.body.includes(PASSWORD), false);
        assert.equal(res.body.includes(HASH), false);
    });
}

test('admin signup requires an uploaded file before creating an account', async () => {
    const req = request(signup);
    const res = response();
    await restaurant.processSignup(req, res);
    assert.match(res.body, /\/admin\/signup/);
    assert.equal(MemberModel.create.mock.callCount(), 0);
    assert.deepEqual(req.events, []);
});

test('admin signup uses the server upload path and rotates its session', async t => {
    t.mock.method(MemberModel, 'findOne', () => query(null));
    t.mock.method(MemberModel, 'create', async input => {
        assert.equal(input.memberImage, 'uploads/member/trusted.png');
        return document(input);
    });
    const req = request({ ...signup, memberImage: 'untrusted.png' });
    req.file = { path: 'uploads/member/trusted.png' };
    const res = response();
    await restaurant.processSignup(req, res);
    assert.deepEqual(req.events, ['regenerate', 'save']);
    assert.equal(Object.hasOwn(req.session.member, 'memberPassword'), false);
    assert.equal(res.location, '/admin/product/all');
});

for (const step of ['regenerate', 'save']) {
    test(`admin signup handles ${step} failure without leaving an authenticated member`, async t => {
        t.mock.method(MemberModel, 'findOne', () => query(null));
        t.mock.method(MemberModel, 'create', async input => document(input));
        const req = request(signup, { [step]: new Error(`${PASSWORD} ${HASH}`) });
        req.file = { path: 'uploads/member/trusted.png' };
        const res = response();
        await restaurant.processSignup(req, res);
        assert.equal(req.session.member, undefined);
        assert.equal(res.location, undefined);
        assert.match(res.body, /\/admin\/signup/);
        assert.equal(res.body.includes(PASSWORD), false);
        assert.equal(res.body.includes(HASH), false);
    });
}

test('protected requests reload current permissions and refresh request/session/view data', async t => {
    let reads = 0;
    t.mock.method(MemberModel, 'findById', id => {
        assert.equal(id, ID);
        reads++;
        return query(document({ memberNick: `fresh-${reads}` }));
    });
    const req = request();
    const res = response();
    let calls = 0;
    await restaurant.verifyRestaurant(req, res, () => calls++);
    assert.equal(req.member.memberNick, 'fresh-1');
    assert.equal(req.session.member, req.member);
    assert.equal(res.locals.member, req.member);
    assert.equal(Object.hasOwn(req.member, 'memberPassword'), false);
    await restaurant.verifyRestaurant(req, res, () => calls++);
    assert.equal(req.member.memberNick, 'fresh-2');
    assert.equal(reads, 2);
    assert.equal(calls, 2);
});

for (const [label, updated] of [
    ['removed', null],
    ['blocked', document({ memberStatus: 'BLOCK' })],
    ['deleted', document({ memberStatus: 'DELETED' })],
    ['demoted', document({ memberType: 'USER' })],
]) {
    test(`existing sessions lose protected access when the account is ${label}`, async t => {
        t.mock.method(MemberModel, 'findById', () => query(updated));
        const req = request();
        req.member = req.session.member;
        const res = response();
        res.locals.member = req.member;
        let next = false;
        await restaurant.verifyRestaurant(req, res, () => { next = true; });
        assert.equal(next, false);
        assert.equal(req.session.member, undefined);
        assert.equal(req.member, undefined);
        assert.equal(res.locals.member, undefined);
        assert.match(res.body, /\/admin\/login/);
    });
}

test('missing and malformed session IDs are denied without database queries', async () => {
    for (const id of [undefined, null, '', 'abcdefghijkl', 'not-an-id', { $ne: null }]) {
        const req = request();
        req.session.member._id = id;
        const res = response();
        await restaurant.verifyRestaurant(req, res, () => assert.fail('Access must be denied'));
        assert.match(res.body, /\/admin\/login/);
    }
    for (const req of [{}, { session: {} }]) {
        const res = response();
        await restaurant.verifyRestaurant(req, res, () => assert.fail('Access must be denied'));
        assert.match(res.body, /\/admin\/login/);
    }
    assert.equal(MemberModel.findById.mock.callCount(), 0);
});

test('authorization database errors fail closed with a generic 500', async t => {
    t.mock.method(MemberModel, 'findById', () => ({ async exec() { throw new Error(`${PASSWORD} ${HASH}`); } }));
    const req = request();
    const res = response();
    await restaurant.verifyRestaurant(req, res, () => assert.fail('Access must be denied'));
    assert.equal(res.statusCode, 500);
    assert.deepEqual(res.body, { code: 500, message: Message.SOMETHING_WENT_WRONG });
    assert.equal(req.session.member, undefined);
    assert.equal(req.member, undefined);
    assert.equal(res.locals.member, undefined);
});

test('member edits accept only valid IDs and status, rejecting additional fields before queries', async () => {
    const base = { _id: ID, memberStatus: 'BLOCK' };
    const invalid = [null, [], {}, { _id: ID }, { memberStatus: 'ACTIVE' },
        { ...base, _id: 'abcdefghijkl' }, { ...base, _id: new mongoose.Types.ObjectId(ID) },
        { ...base, _id: { $ne: null } }, { ...base, memberStatus: 'INVALID' },
        { ...base, memberStatus: { $ne: null } }];
    for (const field of ['memberPassword', 'memberNick', 'memberPhone', 'memberAddress',
        'memberDesc', 'memberImage', 'memberType', 'memberPoints', '$set']) {
        invalid.push({ ...base, [field]: 'injected' });
    }
    for (const input of invalid) await assert.rejects(service.updateUser(input), expectCode(400));
    assert.equal(MemberModel.findOneAndUpdate.mock.callCount(), 0);
});

test('member edits scope updates to users, set only status, and preserve the success wrapper', async t => {
    for (const status of ['ACTIVE', 'BLOCK', 'DELETED']) {
        t.mock.method(MemberModel, 'findOneAndUpdate', (filter, update, options) => {
            assert.equal(filter._id.toHexString(), ID);
            assert.equal(filter.memberType, 'USER');
            assert.deepEqual(update, { $set: { memberStatus: status } });
            assert.deepEqual(options, { new: true, runValidators: true });
            return query(document({ memberType: 'USER', memberStatus: status }));
        });
        const res = response();
        await restaurant.updateUser({ body: { _id: ID, memberStatus: status } }, res);
        assert.equal(res.statusCode, 200);
        assert.deepEqual(Object.keys(res.body), ['user']);
        assert.equal(res.body.user.memberStatus, status);
        assert.equal(Object.hasOwn(res.body.user, 'memberPassword'), false);
    }
});

test('missing or restaurant member-edit targets return 404', async t => {
    t.mock.method(MemberModel, 'findOneAndUpdate', filter => {
        assert.equal(filter.memberType, 'USER');
        return query(null);
    });
    const res = response();
    await restaurant.updateUser({ body: { _id: ID, memberStatus: 'BLOCK' } }, res);
    assert.equal(res.statusCode, 404);
    assert.equal(res.body.code, 404);
});

test('member-edit validation errors retain the JSON error contract', async () => {
    const res = response();
    await restaurant.updateUser({ body: { _id: ID, memberPassword: PASSWORD } }, res);
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.code, 400);
    assert.equal(res.body.message, Message.INVALID_INPUT);
});

test('logout waits for session destruction and preserves its successful redirect', async () => {
    const req = request();
    const res = response();
    const pending = restaurant.goLogout(req, res);
    assert.equal(res.location, undefined);
    await pending;
    assert.deepEqual(req.events, ['destroy']);
    assert.equal(req.session, undefined);
    assert.equal(res.clearedCookie, 'connect.sid');
    assert.equal(res.location, '/admin');
});

test('logout destruction failures terminate with a generic error and clear browser credentials', async () => {
    const req = request({}, { destroy: new Error(`${PASSWORD} ${HASH}`) });
    const res = response();
    await restaurant.goLogout(req, res);
    assert.equal(req.session.member, undefined);
    assert.equal(res.clearedCookie, 'connect.sid');
    assert.equal(res.statusCode, 500);
    assert.deepEqual(res.body, { code: 500, message: Message.SOMETHING_WENT_WRONG });
});

test('check-me serves nicknames as plain text and preserves the anonymous message', () => {
    const req = request();
    req.session.member.memberNick = '<script>alert(1)</script>';
    const res = response();
    restaurant.checkAuthSession(req, res);
    assert.equal(res.contentType, 'text/plain');
    assert.equal(res.body, 'Hi, <script>alert(1)</script>');
    const anonymous = response();
    restaurant.checkAuthSession({}, anonymous);
    assert.equal(anonymous.contentType, 'text/plain');
    assert.equal(anonymous.body, Message.NOT_AUTHENTICATED);
});

test('public controllers retain member wrappers without creating sessions or tokens', async t => {
    t.mock.method(MemberModel, 'create', async input => document(input));
    t.mock.method(MemberModel, 'findOne', () => query(document({ memberType: 'USER' })));
    for (const operation of ['signup', 'login']) {
        const req = { body: signup };
        const res = response();
        await memberController[operation](req, res);
        assert.deepEqual(Object.keys(res.body), ['member']);
        assert.equal(req.session, undefined);
        assert.equal(res.body.member.memberPassword, operation === 'signup' ? '' : undefined);
    }
});

test('authentication logs and error responses never contain plaintext passwords, hashes, or raw records', async t => {
    const logs = [];
    for (const method of ['log', 'error', 'warn', 'info']) {
        t.mock.method(console, method, (...args) => logs.push(args));
    }
    const sensitive = new Error(`${PASSWORD} ${HASH}`);
    sensitive.member = document().toObject();
    t.mock.method(MemberModel, 'findOne', () => { throw sensitive; });
    t.mock.method(MemberModel, 'create', async () => { throw sensitive; });
    const responses = [];
    for (const controller of [memberController, restaurant]) {
        for (const operation of controller === restaurant ? ['processLogin', 'processSignup'] : ['login', 'signup']) {
            const req = request(signup);
            req.file = { path: 'uploads/member/test.png' };
            const res = response();
            await controller[operation](req, res);
            responses.push(res.body);
        }
    }
    const output = JSON.stringify({ logs, responses });
    assert.equal(output.includes(PASSWORD), false);
    assert.equal(output.includes(HASH), false);
    assert.equal(output.includes('memberPassword'), false);
    assert.ok(logs.length >= 4);
});

test('successful authentication and registration do not log credentials or member records', async t => {
    const logs = [];
    for (const method of ['log', 'error', 'warn', 'info']) {
        t.mock.method(console, method, (...args) => logs.push(args));
    }
    t.mock.method(MemberModel, 'create', async input => document(input));
    t.mock.method(MemberModel, 'findOne', () => query(document()));
    for (const operation of ['signup', 'login']) {
        await memberController[operation]({ body: signup }, response());
    }
    await restaurant.processLogin(request(credentials), response());
    t.mock.method(MemberModel, 'findOne', () => query(null));
    const req = request(signup);
    req.file = { path: 'uploads/member/test.png' };
    await restaurant.processSignup(req, response());
    assert.deepEqual(logs, []);
});
