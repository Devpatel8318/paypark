// var mydata = JSON.parse(data);
// alert(mydata[0].name);
// alert(mydata[0].age);
// alert(mydata[1].name);
// alert(mydata[1].age);

// import data from "./example.json" assert { type: "json" };
var map = L.map("map").setView([23.234724, 72.642108], 16);
// var map = L.map("map").setView([38.908838755401035, -77.02346458179596], 12);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);
var x;
var y;

fetch("http://localhost:3000/items")
    .then((res) => res.json())
    .then((json) => {



        json.map((data) => {
            var markers = L.marker([data.xcoo, data.ycoo])
                .addTo(map)
                .bindPopup(data.name);
            var len = document.getElementsByClassName("leaflet-marker-icon").length;
            var names = data.name.split(" ")[0];

            document.getElementsByClassName("leaflet-marker-icon")[len - 1].setAttribute("id", names)

            markers.on("click", function (e) {
                x = e.latlng.lat;
                y = e.latlng.lng;
                panelchanger(x, y);
            });

            return markers;
        });
    });

function panelchanger(x, y) {
    fetch("http://localhost:3000/items")
        .then((res) => res.json())
        .then((json) => {
            json.map((data) => {
                if (data.xcoo == x && data.ycoo == y) {
                    document.getElementById("nameOf").innerHTML = `Name: ${data.name}`;
                    document.getElementById("id").innerHTML = `ID: ${data.id}`;
                    document.getElementById("price").innerHTML = `${data.price}`;
                    
                    document.getElementById("NewButton").classList.add("no");
                    fetch(`http://localhost:3000/stock/${data.id}`)
                        .then((res) => res.json())
                        .then((dataa) => {
                            if(dataa.available==0){
                                document.getElementById("sub").style.display="none";
                                document.getElementById("email").style.display="none";
                                document.getElementById("name").style.display="none";
                                document.getElementById("car_no").style.display="none";
                            }
                            else{
                                document.getElementById("sub").style.display="inline-block";
                                document.getElementById("email").style.display="block";
                                document.getElementById("name").style.display="block";
                                document.getElementById("car_no").style.display="block";
                               
                            }
                            document.getElementById("slotsAvailable").innerHTML = `Slots Available: ${dataa.available}`;
                        });
                }
            });
        });
}


//Location

var Slatitude;
var Slongitude;
var Dlatitude;
var Dlongitude;

document.getElementById("para").onclick = function () {
    getLocation();
};

var x = document.getElementById("para");

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        x.innerHTML = "Geolocation is not supported by this browser.";
    }
}

function showPosition(position) {
    Slatitude = position.coords.latitude;
    Slongitude = position.coords.longitude;
    routing();
}

function showError(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            x.innerHTML = "User denied the request for Geolocation.";
            break;
        case error.POSITION_UNAVAILABLE:
            x.innerHTML = "Location information is unavailable.";
            break;
        case error.TIMEOUT:
            x.innerHTML = "The request to get user location timed out.";
            break;
        case error.UNKNOWN_ERROR:
            x.innerHTML = "An unknown error occurred.";
            break;
    }
}
//Location End

//Routing Start
function routing() {
    // Leaflet has native support for raster maps, So you can create a map with a few commands only!

    // The Leaflet map Object

    // The API Key provided is restricted to JSFiddle website
    // Get your own API Key on https://myprojects.geoapify.com
    const myAPIKey = "bed8b866464f4b369ab39767ba49258d";

    // Retina displays require different mat tiles quality
    const isRetina = L.Browser.retina;

    const baseUrl =
        "https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey={apiKey}";
    const retinaUrl =
        "https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}@2x.png?apiKey={apiKey}";

    L.tileLayer(isRetina ? retinaUrl : baseUrl, {
        attribution:
            'Powered by <a href="https://www.geoapify.com/" target="_blank">Geoapify</a> | <a href="https://openmaptiles.org/" rel="nofollow" target="_blank">© OpenMapTiles</a> <a href="https://www.openstreetmap.org/copyright" rel="nofollow" target="_blank">© OpenStreetMap</a> contributors',
        apiKey: myAPIKey,
        maxZoom: 20,
        id: "osm-bright",
    }).addTo(map);

    // calculate and display routing:
    // from 38.937165,-77.045590 (1920 Quincy Street Northwest, Washington, DC 20011, United States of America)
    const fromWaypoint = [Slatitude, Slongitude]; // latutude, longitude
    const fromWaypointMarker = L.marker(fromWaypoint).addTo(map);

    // to 38.881152,-76.990693 (1125 G Street Southeast, Washington, DC 20003, United States of America)
    const toWaypoint = [x, y]; // latitude, longitude
    const toWaypointMarker = L.marker(toWaypoint).addTo(map);

    const turnByTurnMarkerStyle = {
        radius: 5,
        fillColor: "#fff",
        color: "#555",
        weight: 1,
        opacity: 1,
        fillOpacity: 1,
    };

    fetch(
        `https://api.geoapify.com/v1/routing?waypoints=${fromWaypoint.join(
            ","
        )}|${toWaypoint.join(",")}&mode=drive&apiKey=${myAPIKey}`
    )
        .then((res) => res.json())
        .then(
            (result) => {
                // Note! GeoJSON uses [longitude, latutude] format for coordinates
                L.geoJSON(result, {
                    style: (feature) => {
                        return {
                            color: "rgba(20, 137, 255, 0.7)",
                            weight: 5,
                        };
                    },
                })
                    .bindPopup((layer) => {
                        return `${layer.feature.properties.distance} ${layer.feature.properties.distance_units}, ${layer.feature.properties.time}`;
                    })
                    .addTo(map);

                // collect all transition positions
                const turnByTurns = [];
                result.features.forEach((feature) =>
                    feature.properties.legs.forEach((leg, legIndex) =>
                        leg.steps.forEach((step) => {
                            const pointFeature = {
                                type: "Feature",
                                geometry: {
                                    type: "Point",
                                    coordinates:
                                        feature.geometry.coordinates[legIndex][step.from_index],
                                },
                                properties: {
                                    instruction: step.instruction.text,
                                },
                            };
                            turnByTurns.push(pointFeature);
                        })
                    )
                );

                L.geoJSON(
                    {
                        type: "FeatureCollection",
                        features: turnByTurns,
                    },
                    {
                        pointToLayer: function (feature, latlng) {
                            return L.circleMarker(latlng, turnByTurnMarkerStyle);
                        },
                    }
                )
                    .bindPopup((layer) => {
                        return `${layer.feature.properties.instruction}`;
                    })
                    .addTo(map);
            },
            (error) => console.log(err)
        );
    //Routing End
}



function addressAutocomplete(containerElement, callback, options) {
    const MIN_ADDRESS_LENGTH = 3;
    const DEBOUNCE_DELAY = 300;

    // create container for input element
    const inputContainerElement = document.createElement("div");
    inputContainerElement.setAttribute("class", "input-container");
    containerElement.appendChild(inputContainerElement);

    // create input element
    const inputElement = document.createElement("input");
    inputElement.setAttribute("type", "text");
    inputElement.setAttribute("placeholder", options.placeholder);
    inputContainerElement.appendChild(inputElement);

    // add input field clear button
    const clearButton = document.createElement("div");
    clearButton.classList.add("clear-button");
    addIcon(clearButton);
    clearButton.addEventListener("click", (e) => {
        e.stopPropagation();
        inputElement.value = "";
        callback(null);
        clearButton.classList.remove("visible");
        closeDropDownList();
    });
    inputContainerElement.appendChild(clearButton);

    /* We will call the API with a timeout to prevent unneccessary API activity.*/
    let currentTimeout;

    /* Save the current request promise reject function. To be able to cancel the promise when a new request comes */
    let currentPromiseReject;

    /* Focused item in the autocomplete list. This variable is used to navigate with buttons */
    let focusedItemIndex;

    let currentItems;

    /* Process a user input: */
    inputElement.addEventListener("input", function (e) {
        const currentValue = this.value;

        /* Close any already open dropdown list */
        closeDropDownList();

        // Cancel previous timeout
        if (currentTimeout) {
            clearTimeout(currentTimeout);
        }

        // Cancel previous request promise
        if (currentPromiseReject) {
            currentPromiseReject({
                canceled: true,
            });
        }

        if (!currentValue) {
            clearButton.classList.remove("visible");
        }

        // Show clearButton when there is a text
        clearButton.classList.add("visible");

        // Skip empty or short address strings
        if (!currentValue || currentValue.length < MIN_ADDRESS_LENGTH) {
            return false;
        }

        /* Call the Address Autocomplete API with a delay */
        currentTimeout = setTimeout(() => {
            currentTimeout = null;

            /* Create a new promise and send geocoding request */
            const promise = new Promise((resolve, reject) => {
                currentPromiseReject = reject;

                // The API Key provided is restricted to JSFiddle website
                // Get your own API Key on https://myprojects.geoapify.com
                const apiKey = "bed8b866464f4b369ab39767ba49258d";

                var url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
                    currentValue
                )}&format=json&limit=5&apiKey=${apiKey}`;

                fetch(url).then((response) => {
                    currentPromiseReject = null;

                    // check if the call was successful
                    if (response.ok) {
                        response.json().then((data) => resolve(data));
                    } else {
                        response.json().then((data) => reject(data));
                    }
                });
            });

            promise.then(
                (data) => {
                    // here we get address suggestions
                    currentItems = data.results;

                    /*create a DIV element that will contain the items (values):*/
                    const autocompleteItemsElement = document.createElement("div");
                    autocompleteItemsElement.setAttribute("class", "autocomplete-items");
                    inputContainerElement.appendChild(autocompleteItemsElement);

                    /* For each item in the results */
                    data.results.forEach((result, index) => {
                        /* Create a DIV element for each element: */
                        const itemElement = document.createElement("div");
                        /* Set formatted address as item value */
                        itemElement.innerHTML = result.formatted;
                        autocompleteItemsElement.appendChild(itemElement);

                        /* Set the value for the autocomplete text field and notify: */
                        itemElement.addEventListener("click", function (e) {
                            inputElement.value = currentItems[index].formatted;
                            callback(currentItems[index]);
                            /* Close the list of autocompleted values: */
                            closeDropDownList();
                            showMap(latitude, longitude);
                        });
                    });
                },
                (err) => {
                    if (!err.canceled) {
                        console.log(err);
                    }
                }
            );
        }, DEBOUNCE_DELAY);
    });

    /* Add support for keyboard navigation */
    inputElement.addEventListener("keydown", function (e) {
        var autocompleteItemsElement = containerElement.querySelector(
            ".autocomplete-items"
        );
        if (autocompleteItemsElement) {
            var itemElements = autocompleteItemsElement.getElementsByTagName("div");
            if (e.keyCode == 40) {
                e.preventDefault();
                /*If the arrow DOWN key is pressed, increase the focusedItemIndex variable:*/
                focusedItemIndex =
                    focusedItemIndex !== itemElements.length - 1
                        ? focusedItemIndex + 1
                        : 0;
                /*and and make the current item more visible:*/
                setActive(itemElements, focusedItemIndex);
            } else if (e.keyCode == 38) {
                e.preventDefault();

                /*If the arrow UP key is pressed, decrease the focusedItemIndex variable:*/
                focusedItemIndex =
                    focusedItemIndex !== 0
                        ? focusedItemIndex - 1
                        : (focusedItemIndex = itemElements.length - 1);
                /*and and make the current item more visible:*/
                setActive(itemElements, focusedItemIndex);
            } else if (e.keyCode == 13) {
                /* If the ENTER key is pressed and value as selected, close the list*/
                e.preventDefault();
                if (focusedItemIndex > -1) {
                    closeDropDownList();
                    showMap(latitude, longitude);
                }
            }
        } else {
            if (e.keyCode == 40) {
                /* Open dropdown list again */
                var event = document.createEvent("Event");
                event.initEvent("input", true, true);
                inputElement.dispatchEvent(event);
            }
        }
    });

    function setActive(items, index) {
        if (!items || !items.length) return false;

        for (var i = 0; i < items.length; i++) {
            items[i].classList.remove("autocomplete-active");
        }

        /* Add class "autocomplete-active" to the active element*/
        items[index].classList.add("autocomplete-active");

        // Change input value and notify
        inputElement.value = currentItems[index].formatted;
        callback(currentItems[index]);
    }

    function closeDropDownList() {
        const autocompleteItemsElement = inputContainerElement.querySelector(
            ".autocomplete-items"
        );
        if (autocompleteItemsElement) {
            inputContainerElement.removeChild(autocompleteItemsElement);
        }

        focusedItemIndex = -1;
    }

    function addIcon(buttonElement) {
        const svgElement = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "svg"
        );
        svgElement.setAttribute("viewBox", "0 0 24 24");
        svgElement.setAttribute("height", "24");

        const iconElement = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "path"
        );
        iconElement.setAttribute(
            "d",
            "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
        );
        iconElement.setAttribute("fill", "currentColor");
        svgElement.appendChild(iconElement);
        buttonElement.appendChild(svgElement);
    }

    /* Close the autocomplete dropdown when the document is clicked. 
                Skip, when a user clicks on the input field */
    document.addEventListener("click", function (e) {
        if (e.target !== inputElement) {
            closeDropDownList();
            // showMap(latitude,longitude);
        } else if (!containerElement.querySelector(".autocomplete-items")) {
            // open dropdown list again
            var event = document.createEvent("Event");
            event.initEvent("input", true, true);
            inputElement.dispatchEvent(event);
        }
    });
}
var latitude = 23.233323;
var longitude = 72.651392;
addressAutocomplete(
    document.getElementById("autocomplete-container"),
    (data) => {
        latitude = data.lat;
        longitude = data.lon;
        console.log(latitude, longitude, "Hellooo");
    },
    {
        placeholder: "Enter Loaction to find parking",
    }
);

function showMap(latitude, longitude) {
    map.flyTo([latitude, longitude], 13);
}
document.getElementById("para2").onclick = function () {
    var url2 = `https://www.google.com/maps/dir/?api=1&origin=${Slatitude},${Slongitude}&destination=${x},${y}`;
    window.open(url2, "_blank");
};

var a;
var b;

document.getElementById("nearest").onclick = function () {
    getLocation2();
};
function getLocation2() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition2, showError);
    } else {
        x.innerHTML = "Geolocation is not supported by this browser.";
    }
}
function showPosition2(position) {
    a = position.coords.latitude;
    b = position.coords.longitude;
    // console.log(a,b);
    nearest(a, b);
}
// let id;
let id;
function nearest(xcoo, ycoo) {
    fetch("http://localhost:3000/items")
        .then((res) => res.json())
        .then((json) => {
            let arr = [];
            // console.log(json);
            json.map((data) => {
                arr.push([Number(data.xcoo), Number(data.ycoo), data.name]);
            });
            return arr; // array of coordinates of markers
        })
        .then((arr) => {
            // console.log(arr); //array of coordinates of markers
            // console.log(xcoo, ycoo); //live location coords
            var kilometer = 1000000000000000;
            arr.forEach((data) => {
                // console.log(data);
                // var marker = L.marker([xcoo,ycoo]).addTo(map);
                // kilometer=getDistanceFromLatLonInKm(data[0], data[1], xcoo, ycoo);
                // getDistanceFromLatLonInKm(data[0], data[1], xcoo, ycoo);
                // console.log(data[2].split(" ")[0],getDistanceFromLatLonInKm(data[0], data[1], xcoo, ycoo));
                var temperory = getDistanceFromLatLonInKm(data[0], data[1], xcoo, ycoo);
                if (temperory < kilometer) {
                    kilometer = temperory;
                    id = data[2].split(" ")[0];
                }
            });
            arr.forEach((data) => {
                if (data[2].split(" ")[0] == id) {
                    map.flyTo([data[0], data[1]], 17);
                    document.getElementById(id).click();
                }
            });
        });

}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1);  // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
        ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180)
}

const formEl = document.querySelector(".form1");

formEl.addEventListener("submit", () => {
    const formData = new FormData(formEl);
    const dataOfForm = Object.fromEntries(formData);
    var fetchedId = document.getElementById("id").innerText.slice(4);
    fetch(`http://localhost:3000/stock/${fetchedId}`)
        .then((res) => res.json())
        .then((json) => {

            var total = json.customer.length + json.available;
            console.log(total);

            function getRndInteger(min, max) {
                return Math.floor(Math.random() * (max - min + 1)) + min;
            }

            console.log(json.slot);
            var slot = json.slot;
            var r = getRndInteger(1, total);

            while (true) {
                r = getRndInteger(1, total);
                if (slot.includes(r)) {
                    continue;
                } else {
                    slot.push(r);
                    break;
                }
            }

            var customeer = json.customer
            var name = json.name
            var car = json.car
            var stats = json.status
            customeer.push(`${dataOfForm.email}`);
            name.push(dataOfForm.name);
            car.push(dataOfForm.car_no);
            stats.push(1);






            fetch(`http://localhost:3000/stock/${fetchedId}`, {
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json"
                },
                method: "PATCH",

                body: JSON.stringify({
                    "customer": customeer,
                    "name": name,
                    "available": json.available - 1,
                    "car": car,
                    "status": stats,
                    "slot":slot
                })

            });
        });
});





// template_jgaymhl


// function sendMail() {
//     var params = {
//         name: document.getElementById("name").value,
//         email_id: document.getElementById("mail").value,
//         message: otpGenerator(),
//     };
//     emailjs
//         .send("service_cyxbt0d", "template_plwjtef", params)
//         .then(function (res) {
//             alert(`Mail sent to ${document.getElementById("mail").value}`);
//         });
//     document.getElementById("verify").style.display = "none"
// }


