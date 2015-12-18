(function () {
    loadOptions();
    submitHandler();
})();

function submitHandler() {
    var $submitButton = $('#submitButton');

    $submitButton.on('click', function () {
        console.log('User Clicked Submit');

        var return_to = getQueryParam('return_to', 'pebblejs://close#');
        document.location = return_to + encodeURIComponent(JSON.stringify(getAndStoreConfigData()));
    });
}

function loadOptions() {
    //get config elements

    if (localStorage.OPTION) {
        //set the value of of each to the stored option
    }
}

function getAndStoreConfigData() {
    //get config elements

    //store them in a library
    var options = {

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