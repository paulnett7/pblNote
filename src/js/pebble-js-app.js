var clientID = "0000000044174804";
var redirectURL = "paulnett7.github.io/pblnote/config/config-page.html";

var xhrRequest = function (url, type, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        callback(this.responseText);
    };
    xhr.open(type, url);
    xhr.send();
};

function sendNewTokens(accessToken, refreshToken) {
    //dictionary to send via AppMessage
    var dict = {
        'KEY_AUTH_TOKEN': config_data.access_token,
        'KEY_REFRESH_TOKEN': config_data.refresh_token
    };

    Pebble.sendAppMessage(dict, function (e) {
        console.log('Sent config data to Pebble');
    }, function (e) {
        console.log('Failed to send config data!');
    });
}

function getNewTokens(refreshToken) {
    var url = "https://login.live.com/oauth20_token.srf?grant_type=refresh_token&client_id=" + clientID + "&client_secret=" + clientSecret + "&redirect_uri=" + redirectURL + "&refresh_token=" + refreshToken;

    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        var response = JSON.parse(this.responseText);

        console.log("Recieved authentication token: " + JSON.stringify(response));

        sendNewTokens(response.access_token, response.refresh_token);

        return response.access_token;
    };
    xhr.open('POST', url, true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send();
}

Pebble.addEventListener('ready',
	function(e) {
		console.log('PebbleKit JS ready');
	}
);

Pebble.addEventListener('appmessage',
	function(e) {
		console.log('AppMessage received: ' + JSON.stringify(e.payload));
		var data = JSON.parse(e.payload);
        
		if (data.KEY_REFRESH_TOKEN) {
		    var accessToken = getNewTokens(data.KEY_REFRESH_TOKEN);

		    var url = "https://www.onenote.com/api/v1.0/me/notes/pages";

		    var xhr = new XMLHttpRequest();
		    //xhr.onload = function () { };
		    xhr.open('POST', url, true);
		    xhr.setRequestHeader("Authorization", "Bearer " + accessToken);
		    xhr.setRequestHeader("Content-Type", "text/html; charset=utf-8");
		    xhr.setRequestHeader("Accept", "application/json");
		    xhr.send("<!DOCTYPE html><html>"
                + "<head><title>Quick Note created by pblNote</title></head>"
                + "<body><p>" + data.KEY_QUICKNOTE_TEXT + "</p></body></html>"
            );
		}
	}
);

Pebble.addEventListener('showConfiguration', 
	function (e) {
	    var url = 'https://paulnett7.github.io/pblNote/config/config-page.html';

	    console.log('Showing config page: ' + url);

		Pebble.openURL(url);
	}
);

Pebble.addEventListener('webviewClosed',
	function(data) {
		var config_data = JSON.parse(decodeURIComponent(data.response));
		console.log('Config window returned: ', JSON.stringify(config_data));

		if (config_data.refresh_token) {
		    sendNewTokens(config_data.access_token, config_data.refresh_token);
		}
		else {
		    console.log('Data retrivial failed.');
		}
	}
);
