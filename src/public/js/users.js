//const { response } = require("express");

console.log("Users frontend javascript file");

$(function () {
    $(".member-status").on("change", function (e) {
        const id = e.target.id;
        console.log("id: ", id);

        const memberStatus = $(`#${id}.member-status`).val();
        console.log("memberStatus: ", memberStatus);

        axios
            .post("/admin/user/edit", { _id: id, memberStatus: memberStatus })
            .then((response) => {
                const result = response.data;
                console.log("result: ", result);
                if (result.user) {
                    console.log("User-status updated successfully");
                    $(".member-status").blur();
                    alert("User updated successfully");
                } else alert("User update failed1");
            })
            .catch((err) => {
                console.log(err);
                alert("User update failed2")
            });

    });
});
