window.onload = function () {
    namee = document.getElementById("Name");
    mail = document.getElementById("mail")
    car = document.getElementById("car")
    price = document.getElementById("price")


    var currentdate = new Date();

    var date = currentdate.getDate() + "/"
    + (currentdate.getMonth() + 1) + "/"
    + currentdate.getFullYear()

    var time = currentdate.getHours() + ":"
    + currentdate.getMinutes()

    document.getElementById("time").innerHTML=`${time}<br>${date}`



    console.log(date);
    console.log(time);

    fetch("http://localhost:3000/receipt/1")
        .then((res) => res.json())
        .then((data) => {
            // console.log(data);
            document.getElementById("name").innerText = data.name
            document.getElementById("pname").innerText = data.pname
            document.getElementById("mail").innerText = data.email
            document.getElementById("car").innerText = data.car
            document.getElementById("price").innerText = data.amount
            document.getElementById("slot").innerText = data.slot
        });
    document.getElementById("download")
        .addEventListener("click", () => {



            const invoice = this.document.getElementById("invoice");
            console.log(invoice);
            console.log(window);
            var opt = {
                margin: 1,
                filename: 'myfile.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
            };
            html2pdf().from(invoice).set(opt).save();
        })
}