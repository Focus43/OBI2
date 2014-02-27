/**
 * Created with JetBrains RubyMine.
 * By: superrunt
 * Date: 1/14/14
 * Time: 11:38 AM
 */

/**
 * displaying maps
 */
angular.module('obiWan').config(function($provide) {
    $provide.factory('displayMap', function() {
        return function (elem, attrs) {
            var mapOptions,
                latitude = (attrs && attrs.location) ? attrs.location.latitude : null,
                longitude = (attrs && attrs.location) ? attrs.location.longitude : null,
                address = (attrs && attrs.address1) ? attrs.address1 + " " + attrs.address2 : null,
                map;
            // first create a 'default' map (regardless if lat/long is avail)
            latitude = latitude && parseFloat(latitude, 10) || 43.654832;
            longitude = longitude && parseFloat(longitude, 10) || -110.716465;

            mapOptions = {
                zoom: 15,
                center: new google.maps.LatLng(latitude, longitude)
            };

            map = new google.maps.Map(elem[0], mapOptions);
            // if no lat/long was sent in try geocoding the address
            var geocoder = new google.maps.Geocoder();
            geocoder.geocode( { 'address': address}, function(results, status) {
                if (status === google.maps.GeocoderStatus.OK) {
                    map.setCenter(results[0].geometry.location);
                    var marker = new google.maps.Marker({
                        map: map,
                        position: results[0].geometry.location
                    });
                } else {
                    console.log('Geocode was not successful for the following reason: ' + status);
                }
            });
        };
    });
});

angular.module('obiWan').config(function($provide) {
    $provide.factory('initLiveChat', function() {

        return function() {
            var se = document.createElement('script'); se.type = 'text/javascript'; se.async = true;
            se.src = '//commondatastorage.googleapis.com/code.snapengage.com/js/9635e73f-8c76-49bd-8645-c2aaea43e407.js';
            var done = false;
            se.onload = se.onreadystatechange = function() {
                if (!done&&(!this.readyState||this.readyState==='loaded'||this.readyState==='complete')) {
                    done = true;
                    // Place your SnapEngage JS API code below
                    //SnapEngage.openProactiveChat(true, true); // Example: open the proactive chat on load
                }
            };
            var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(se, s);
        };
    });
});

angular.module('obiWan').config(function($provide) {
    $provide.factory('initGoogleAnalytics', function() {
        return function () {
            (function (i,s,o,g,r,a,m) {
                i['GoogleAnalyticsObject'] = r;
                i[r] = i[r] || function() { (i[r].q=i[r].q||[]).push(arguments); }, i[r].l=1*new Date();
                a=s.createElement(o),
                m=s.getElementsByTagName(o)[0];
                a.async=1;
                a.src=g;
                m.parentNode.insertBefore(a,m);
            })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

            ga('create', 'UA-42079005-2', 'vpsdevsite.com');
        };
    });
});

angular.module('obiWan').config(function($provide) {
    $provide.factory('initGoogleMaps', function() {
        return function() {
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&' +
                'callback=OBI.initializeGMap';
            document.body.appendChild(script);
        };
    });
});



