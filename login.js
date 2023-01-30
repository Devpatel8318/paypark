window.onload = function () {
    const formEl = document.querySelector(".form1");
    formEl.addEventListener("submit", (event) => {
        event.preventDefault();
        const formData = new FormData(formEl);
        const dataOfForm = Object.fromEntries(formData);
        // console.log(dataOfForm);



        var x = "";



        fetch("http://localhost:3000/items")
            .then((res) => res.json())
            .then((json) => {
                json.map((dataJson) => {

                    // console.log(dataJson);
                    // console.log("form vadu:", dataOfForm.email);
                    //     console.log("database vadu:", dataJson.mail);
                    if (dataOfForm.email == dataJson.mail) {

                        x = dataJson;
                        // console.log(x);
                    }
                });


                if (x == "") {
                    alert("Email not Found");
                }
                else if (x.password == dataOfForm.password) {



                    console.log(x.name);
                    var person2 = {
                        "id": 1,
                        "logged": x.id
                    }


                    fetch("http://localhost:3000/idd/1", {
                        headers: {
                            Accept: "application/json",
                            "Content-Type": "application/json"
                        },
                        method: "PATCH",

                        // Fields that to be updated are passed
                        body: JSON.stringify({
                            "logged": x.id
                        })
                    }).then(function (data) {
                        openNewURLInTheSameWindow("http://127.0.0.1:5500/Intenship/jsonMate/dashboard.html");
                    });







                }
                else {
                    if (document.getElementById("password").value == "") {
                        alert("Please Enter Password");
                    }
                    else {
                        alert("Khotu");
                    }

                }


            });














    });


    function fireClickEvent(element) {
        var evt = new window.MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true
        });

        element.dispatchEvent(evt);
    }

    function openNewURLInTheSameWindow(targetURL) {
        var a = document.createElement('a');
        a.href = targetURL;
        fireClickEvent(a);
    }
}