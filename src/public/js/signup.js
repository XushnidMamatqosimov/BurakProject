console.log("Signup frontend javascript file");
$(function () {
    $(".member-nick").click(function () {
        $(".member-phone").toggle()
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
}
