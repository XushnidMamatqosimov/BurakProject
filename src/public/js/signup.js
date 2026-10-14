console.log("Signup frontend javascript file");
$(function () {
    const fileTarget = $(".file-box .upload-hiddin");
    let fileName; 

    fileTarget.on("change", function () {
        if(window.FileReader){
            const uploadFile = $(this)[0].files[0];
            const fileType = uploadFile("type");
            const validImageType = ["image/jpg","image/jpeg","image/png"];
            if(!validImageType.includes(fileType)){
                alert("Please insert only JPEG, JPG, PNG");
            } else{
                if(uploadFile){
                    console.log(URL.createObjectURL(uploadFile));
                    $(".upload-img-frame")
                        .attr("src", URL.createObjectURL(uploadFile))
                        .addClass("success");
                }
                fileName = $(this)[0].files[0].name;
            }
            $(this).siblings(".upload-name").val(fileName);
        }
    });
});

function validateSignUpForm(){
    const memberNick = $(".member-nick").val();
    const memberPhone = $(".member-phone").val();
    const memberPassword = $(".member-password").val();
    const confirmPassword = $(".confirm-password").val();

    if(memberNick === "" || memberPhone === "" || memberPassword === "" || confirmPassword === ""){
        alert("Please enter required inputs");
        return false;
    }
    if(memberPassword !== confirmPassword){
        alert("Password do not match");
        return false;
    }
    const memberImage = $(".member-image").get(0).files[0].name ? $(".member-image").get(0).files[0].name : null;
    if(!memberImage){
        alert("Please insert Restaurant Photo");
        return false;
    }
    return true;
}
