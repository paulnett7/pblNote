var xhrRequest = function (url, type, callback) {
	var xhr = new XMLHttpRequest();
	xhr.onload = function () {
		callback(this.responseText);
	};
	xhr.open(type, url);
	xhr.send();
};

function getNotebooks() {
	//get OAuth token
	
	//send request
}

Pebble.addEventListener('ready',
	function(e) {
		console.log('PebbleKit JS ready');
		
		getNotebooks();
	}
);

Pebble.addEventListener('appmessage',
	function(e) {
		console.log('AppMessage received');
		
		getNotebooks();
	}
);

Pebble.addEventListener('showConfiguration', 
	function (e) {
	    var url = 'https://pblNote.com/config-page.html';

	    console.log('Showing config page: ' + url);

		Pebble.openURL(url);
	}
);

Pebble.addEventListener('webviewClosed',
	function(data) {
		var config_data = JSON.parse(decodeURIComponent(data.response));
		console.log('Config window returned: ', JSON.stringify(config_data));

		if (config_data.OAuth) {
		    //dictionary to send via AppMessage
		    var dict = {
		        //keys of the config data, OAuth token
		    };
		}
	
		Pebble.sendAppMessage(dict, function() {
			console.log('Sent config data to Pebble');
		}, function() {
			console.log('Failed to send config data!');
		});
	}
);
