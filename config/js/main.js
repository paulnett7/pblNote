(function () {
    //loadOptions();
    authHandler();
    submitHandler();
    if (getQueryVariable("code")) {
        authorized();
    }
})();

var clientID = "0000000044174804";
var redirectURL = "https%3a%2f%2fpaulnett7.github.io%2fpblnote%2fconfig%2fconfig-page.html";

var accessToken;
var refreshToekn;

var xhrRequest = function (url, type, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        callback(this.responseText);
    };
    xhr.open(type, url);
    xhr.setRequestHeader("Access-Control-Allow-Origin", "https://paulnett7.github.io");
    xhr.send();
};


function authHandler() {
    var $authButton = $('#authButton');

    $authButton.on('click', function () {
        console.log('Redirecting to authorization');

        var scopes = "office.onenote_update%20wl.offline_access";
        
        var url = "https://login.live.com/oauth20_authorize.srf?response_type=code&client_id=" + clientID + "&redirect_uri=" + redirectURL + "&scope=" + scopes;

        window.location.replace(url);
        /*xhrRequest(url, 'GET', function (responseText) {
            console.log("CODE Response recieved.")

            var authCode = getQueryVariable(code);
            var clientSecret = "AXefzX7w7NO9EmK-8BbcroK9cuJXwzCx";

            //unsure about grant_type
            var url = "https://login.live.com/oauth20_token.srf?grant_type=authorization_code&client_id=" + clientID + "&client_secret=" + clientSecret + "&code=" + authCode + "&redirect_uri=" + redirectURL;

            var xhr = new XMLHttpRequest();
            xhr.onload = function () {
                var response = JSON.parse(this.responseText);

                console.log("Recieved authentication token: " + JSON.stringify(response));

                accessToken = response.access_token;
                refreshToken = response.refresh_token;
            };
            xhr.open('POST', url, true);
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            xhr.send();
        });*/
    });
}

function authorized() {
    console.log("CODE Response recieved.")

    var authCode = getQueryVariable(code);
    var clientSecret = "AXefzX7w7NO9EmK-8BbcroK9cuJXwzCx";

    //unsure about grant_type
    var url = "https://login.live.com/oauth20_token.srf?grant_type=authorization_code&client_id=" + clientID + "&client_secret=" + clientSecret + "&code=" + authCode + "&redirect_uri=" + redirectURL;

    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        var response = JSON.parse(this.responseText);

        console.log("Recieved authentication token: " + JSON.stringify(response));

        accessToken = response.access_token;
        refreshToken = response.refresh_token;
    };
    xhr.open('POST', url, true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send();
}

function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] == variable) { return pair[1]; }
    }
    return (false);
}

function submitHandler() {
    var $submitButton = $('#submitButton');

    $submitButton.on('click', function () {
        console.log('User Clicked Submit');

        var return_to = getQueryParam('return_to', 'pebblejs://close#');
        document.location = return_to + encodeURIComponent(JSON.stringify(getAndStoreConfigData()));
    });
}

/*function loadOptions() {
    //get config elements

    if (localStorage.OPTION) {
        //set the value of of each to the stored option
    }
}*/

function getAndStoreConfigData() {
    //get config elements


    //store them in a library
    var options = {
        "accessToken": accessToken,
        "refreshToken": refreshToekn
    }

    //put them in local storage (localStorage.option = options.option)

    console.log('Got options: ' + JSON.stringify(options));
    return options;
}

function getQueryParam(variable, defaultValue) {
    // Find all URL parameters
    var query = location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        // If the query variable parameter is found, decode it to use and return it for use
        if (pair[0] === variable) {
            return decodeURIComponent(pair[1]);
        }
    }
    return defaultValue || false;
}
