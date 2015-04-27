function findParam(name) {
    var regexp = new RegExp("[&?]" + name + "=([^&]+)"),
        search = regexp.exec(location.search),
        value;

    try {
        value = parseInt(search[1]);
    } catch (e) {}

    return value;
}

function cleanNumber(num) {
    num = parseInt(num);

    if (typeof(num) != "number" || isNaN(num)) {
        num = 0;
    } 
    return num;
}

function setPositionOnMap() {
    var longitude = cleanNumber($("input[name=longitude]").val()) + 180,
        latitude  = - cleanNumber($("input[name=latitude]").val()),
        $map      = $("iframe"),
        mapUri    = $map.attr("src"),
        paramSep  = "=",
        uriSep    = "%2C";

    console.log(longitude)
    console.log(latitude)
    mapUri = mapUri.split(paramSep);
    console.log(mapUri)
    mapUri[mapUri.length - 1] = "" + latitude + uriSep + longitude;
    minLatitude  = latitude - 25;
    minLongitude = longitude - 25;
    maxLatitude  = latitude + 25;
    maxLongitude = longitude + 25;
    mapUri[1] = [
        minLongitude, 
        minLatitude, 
        maxLongitude, 
        "" + maxLatitude + "&layer"].join(uriSep);
    console.log(mapUri)
    mapUri = mapUri.join(paramSep);
    $map.attr("src", mapUri);
}

function askPosition() {
    var watcher = navigator
        .geolocation
        .watchPosition(function (position) {
            var longitude = position.coords.longitude,
                latitude = position.coords.latitude;
            navigator.geolocation.clearWatch(watcher);
            setParams(longitude, latitude);
        },
        function () {},
        { "enableHighAccuracy": true,
            "timeout": 10000,
            "maximumAge": 0 });
}

function setParams(longitude, latitude) {
    var $longitudeInput = $("input[name=longitude]"),
        $latitudeInput  = $("input[name=latitude]");

    if (!longitude) {
        longitude = findParam("longitude");
    }
    if (!latitude) {
        latitude = findParam("latitude");
    }
    if (!longitude || ! latitude) {
        position = askPosition();
    }
    $longitudeInput.val(longitude);
    $latitudeInput.val(latitude);

    setPositionOnMap();
}

$(document).ready(function () {
    setParams();
    $("form").on("submit", function () {
        setPositionOnMap();
        return false;
    });
});
