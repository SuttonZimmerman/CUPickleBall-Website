// live name preview
let nameInput = document.getElementById("name");
let namePreview = document.getElementById("namePreview");

nameInput.addEventListener("input", function () {
    if (nameInput.value.trim() === "") {
        namePreview.textContent = "Name: (not entered)";
    } else {
        namePreview.textContent = "Name: " + nameInput.value;
    }
});

//form submission 
let requestForm = document.getElementById("request-form");
let formFeedback = document.getElementById("formFeedback");

requestForm.addEventListener("submit", function (event) {
    event.preventDefault();

    let name = nameInput.value.trim();

    if (name === "") {
        formFeedback.textContent = "Please enter your name.";
        formFeedback.classList.add("error");
    }
    else {
        let session = document.getElementById("session").value;
        formFeedback.textContent = "Thank you, " + name +
            "! Your request for " + session + " was submitted successfully.";
        formFeedback.classList.add("success");
        formFeedback.classList.remove("error");

        let requestList = document.getElementById("requestList");


        let newRequest = document.createElement("li");

        if (session === "") {
            session = "No session selected";
        }

        let date = document.getElementById("date").value;
        let time = document.getElementById("time").value;

        newRequest.textContent = name + " - " + date + ", " + time + ", " + session;

        requestList.appendChild(newRequest);

        let removeButton = document.createElement("button");

        removeButton.type = "button";
        removeButton.textContent = "Remove";
        removeButton.classList.add("remove-button");
        newRequest.appendChild(removeButton);

        let requestCount = document.getElementById("requestCount");
        requestCount.textContent = requestList.children.length;

        // Reset the form after a successful registration
        requestForm.reset();
        namePreview.textContent = "Name: (not entered)";
    }
});


//remove requests
let requestList = document.getElementById("requestList");

requestList.addEventListener("click", function (event) {
    if (event.target.tagName === "BUTTON") {
        event.target.parentElement.remove();

        let requestCount = document.getElementById("requestCount");
        requestCount.textContent = requestList.children.length;
    }
});


//clear all requests
let clearRequests = document.getElementById("clearRequests");

clearRequests.addEventListener("click", function () {
    requestList.textContent = "";

    let requestCount = document.getElementById("requestCount");
    requestCount.textContent = "0";
});


//hide and show details
let toggleDetails = document.getElementById("toggleDetails");
let details = document.getElementById("details");

toggleDetails.addEventListener("click", function () {
    details.classList.toggle("hidden");

    if (details.classList.contains("hidden")) {
        toggleDetails.textContent = "Show Details";
    }
    else {
        toggleDetails.textContent = "Hide Details";
    }
});


// suttons bullshit \/



