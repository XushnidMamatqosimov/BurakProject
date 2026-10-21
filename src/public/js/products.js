console.log("Products frontend javascript file");

$(function () {     // document-ready
    $(".product-collection").on("change", () => {
        const selectedValue = $(".product-collection").val();
        if (selectedValue === "DRINKS") {    // DRINK bolganda
            $("#product-collection").hide();
            $("#product-volume").show();
        } else {     // DISH bolganda
            $("#product-volume").hide()
            $("#product-collection").show();
        }
    });

    $("#process-btn").on("click", () => {    // create button bosilsa ochil
        $(".dish-container").slideToggle(500);
        $("#process-btn").css("display", "none");
    });
    $("#cancel-btn").on("click", () => {    // cancel button bosilsa yopil
        $(".dish-container").slideToggle(100);
        $("#process-btn").css("display", "flex");
    });

    $(".new-product-status").on("change", async function (e) {
        const id = e.target.id;
        const productStatus = $(`#${id}.new-product-status`).val();
        console.log("id", id);
        console.log("productStatus", productStatus);
        try {
            const response = await axios.post(`/admin/product/${id}`, { productStatus: productStatus });
            console.log("response: ", response);
            const result = response.data;
            if (result.data) {
                console.log("Product Updated");
                $(".new-product-status").blur();
            } else alert("Product Update failed");
        } catch (err) {
            console.log(err);
            alert("Product update failed");
        }
    });
});



function validationForm() {
    const productName = $(".product-name").val();
    const productPrice = $(".product-price").val();
    const productLeftCount = $(".product-left-count").val();
    const productCollection = $(".product-collection").val();
    const productDesc = $(".product-desc").val();
    const productStatus = $(".product-status").val();

    if (productName === "" ||
        productPrice === "" ||
        productLeftCount === "" ||
        productCollection === "" ||
        productDesc === "" ||
        productStatus === ""
    ) {
        alert("Please insert all required fields!");
        return false;
    }
    return true;
}

function previewFileHandler(input, order) {
    const imgClassName = input.className;
    console.log("imgClassName", imgClassName);

    const file = $(`.${imgClassName}`).get(0).files[0];
    const fileType = file["type"];
    const validImageType = ["image/jpg", "image/jpeg", "image/png"];
    if (!validImageType.includes(fileType)) {
        alert("Please insert only JPEG, JPG, PNG");
    } else {
        if (file) {
            const reader = new FileReader();
            reader.onload = function () {
                $(`#image-section-${order}`).attr("src", reader.result);
            };
            reader.readAsDataURL(file);
        }
    }
}

