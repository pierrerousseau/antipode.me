/* globals */
var currentPosition = [0, 0];

/* antipode */
function antipodeLongitude(longitude) {
    return longitude > 180 ? longitude - 180 : longitude + 180;
}

function antipodeLatitude(latitude) {
    return - latitude;
}

/* OL */
function olPosition(longitude, latitude) {
    return ol.proj.transform([longitude, latitude], 'EPSG:4326', 'EPSG:3857');
}

function llPosition(position) {
    return ol.proj.transform(position, 'EPSG:3857', 'EPSG:4326');
}

/* move */
function move(to, map, duration, $marker) {
    var pan,
        marker;

    pan = ol.animation.pan({
        "duration": duration,
        "source": currentPosition
    });
    map.beforeRender(pan);
    map.getView().setCenter(to);
    currentPosition = to;

    
    if ($marker && $marker.length) {
        marker = new ol.Overlay({
            positioning: 'center-center',
            element: $marker[0],
            position: to
        });
        map.addOverlay(marker);
    }
}

function setPositionOnMap(map, position) {
    var longitude = position[0],
        latitude  = position[1],
        start     = olPosition(longitude, latitude),
        antipode  = olPosition(antipodeLongitude(longitude), 
                               antipodeLatitude(latitude)),
        timer,
        duration  = 3000,
        $you      = $("#you"),
        $antipode = $("#antipode");

        move(start, map, duration, $you);
        timer = setTimeout(function () { 
            clearTimeout(timer);
            move(antipode, map, duration, $antipode); 
        }, duration);
}

/* form */
function cleanNumber(num) {
    num = parseInt(num);

    if (typeof(num) != "number" || isNaN(num)) {
        num = 0;
    } 
    return num;
}

function formPosition() {
    var $longitude = $("input[name=longitude]"),
        $latitude  = $("input[name=latitude]"),
        longitude  = cleanNumber($longitude.val()),
        latitude   = cleanNumber($latitude.val());

    $longitude.val(longitude);
    $latitude.val(latitude);

    return [longitude, latitude];
}

/* geolocation */
function geolocate(map) {
    var $error = $("#geo-error"),
        geolocation = new ol.Geolocation({
            "projection": map.getView().getProjection(),
            "trackingOptions": {
                "enableHighAccuracy": true,
                "timeout": 10000,
                "maximumAge": 1000
            },
            "tracking": true
    });

    /* FixMe: a loader waiting change */
    geolocation.once("change", function(evt) {
        var position = llPosition(geolocation.getPosition());

        /* FixMe: function to get and set inputs */
        $("input[name=longitude]").val(position[0]);
        $("input[name=latitude]").val(position[1]);
        setPositionOnMap(map, position);
    });

    geolocation.on("error", function () {
        $error.html("Please activate geolocalisation or et your coordinates");
    });

    return geolocation;
}

/* main */
function newMap(startPosition, zoom) {
    var map, 
        view; 

    view = new ol.View({
        "center": startPosition,
        "zoom": zoom
    });
    map = new ol.Map({
        "target": "map",
        "loadTilesWhileAnimating": true,
        "layers": [
            new ol.layer.Tile({
                "source": new ol.source.OSM(),
            })
        ],
        "view": view
    });

    return map;
}

$(document).ready(function () {
    var startPosition = currentPosition,
        zoom          = 5,
        map           = newMap(startPosition, zoom),
        geolocation;

    geolocation = geolocate(map);
    $("form").on("submit", function () {
        var $error = $("#geo-error");

        setPositionOnMap(map, formPosition());
        $error.html("");

        return false;
    });

});
