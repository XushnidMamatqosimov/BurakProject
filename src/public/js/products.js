console.log("Products frontend javascript file");

$("#process-btn").on("click", ()=> {
    $(".dish-container").slideToggle(500);
    $("#process-btn").css("display", "none");
});
$("#cancel-btn").on("click", ()=> {
    $(".dish-container").slideToggle(100);
    $("#process-btn").css("display", "flex");
})


$(function (){
    $(".product-collection").on("change", ()=>{
        const selectedValue = $(".product-collection").val();
        if(selectedValue === "DRINKS"){
            $("#product-collection").hide();
            $("#product-volume").show();
        }else{
            $("#product-volume").hide()
            $("#product-collection").show();
        }
    });
});

function validationForm(){
    const productName = $(".product-name").val();
    const productPrice = $(".product-price").val();
    const productLeftCount = $(".product-left-count").val();
    const productCollection = $(".product-collection").val();
    const productDesc = $(".product-desc").val();
    const productStatus = $(".product-status").val();

    if( productName === "" || 
        productPrice === "" || 
        productLeftCount === "" || 
        productCollection === "" || 
        productDesc === "" || 
        productStatus === "" 
    ){
        alert("Please insert all required fields!");
        return false;
    }
    return true;
}

function previewFileHandler(input, order){
    const imgClassName = input.className;
    console.log("imgClassName", imgClassName);

    const file = $(`.${imgClassName}`).get(0).files[0];
    const fileType = file["type"];
    const validImageType = ["image/jpg","image/jpeg","image/png"];
    if(!validImageType.includes(fileType)){
        alert("Please insert only JPEG, JPG, PNG");
    } else{
        if(file){
            const reader = new FileReader();
            reader.onload = function() {
                $( `#image-section-${order}`).attr("src", reader. result);
            };
            reader.readAsDataURL(file);
        }
    }
}

