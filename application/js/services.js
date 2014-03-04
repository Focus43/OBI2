/**
 * Created with RubyMine.
 * By: superrunt
 * Date: 2/27/14
 * Time: 1:01 PM
 */


/**
 * openbookService module; mixin to obiWan
 */
var openbookService = angular.module('openbookService', ['ngRoute', 'ngResource']).
    config(['$locationProvider', '$httpProvider', '$routeProvider', '$compileProvider', function($locationProvider, $httpProvider, $routeProvider, $compileProvider){

        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];

        // push state vs hash-based urls
        $locationProvider.html5Mode(true);

        // routes
        $routeProvider.when('/', {templateUrl: 'templates/hotel/_search.html', controller: 'SearchCtrl'})
            .when('/external', {templateUrl: '/templates/hotel/_searchembed.html', controller: 'SearchCtrl'})
            .when('/hotels/:location/:from/:to/:rooms', {templateUrl: '/templates/hotel/_list.html', controller: 'ResultsCtrl'})
            .when('/detail/:providerCode/:chainId/:hotelId/:from/:to', {templateUrl: '/templates/hotel/_hotel_detail.html', controller: 'HotelDetailCtrl'})
            .when('/checkout', {templateUrl: '/_checkout.html', controller: 'BookingCtrl'})
            .when('/thankyou/:confirmation', {templateUrl: '/templates/hotel/_thankyou.html', controller: 'ConfirmationCtrl'})

            .when('/air', {templateUrl: '/templates/air/_search.html', controller: 'AirSearchCtrl'})
            .when('/air/flights', {templateUrl: '/templates/air/_list.html', controller: 'AirResultsCtrl'})

            .when('/contact', {templateUrl: '/base/_contact.html', controller: 'ContactCtrl'})
            .when('/faq', {templateUrl: '/templates/base/_faq.html', controller: 'StaticCtrl'})
            .when('/privacy', {templateUrl: '/templates/base/_privacy.html', controller: 'StaticCtrl'})
            .otherwise({redirectTo: '/'});
    }]).
    factory('Search', ['$resource', function( $resource ) {
        var Search = $resource( OBI.airRootUrl + '/:searchtype/:prefix/:urlLocation', { searchtype: '@searchtype', prefix: '@prefix', urlLocation:'@location' }, {
            hotelSearch: { method: "GET" },
            flightSearch: { method: "GET" }
        });

        Search.prototype.hotelSearch = function (config, cb) {
            config.searchtype = 'hotels';
            config.prefix = 'location';
            config.from = OBI.convertToAPIDate(config.fromDate);
            config.to = OBI.convertToAPIDate(config.toDate);

            if ( Search.previousLocation !== config.location ) {
                Search.previousLocation = config.location;
                config.distance = OBI.defaultDistance;
            }
            var query = angular.copy(config);
            delete query.fromDate;
            delete query.toDate;
            return Search.hotelSearch(query,
                angular.extend({}, this, {_id:undefined}), cb);
        };

        Search.prototype.flightSearch = function (config, cb) {
            config.searchtype = 'air';
            config.prefix = 'availability';
            config.departureDate = OBI.convertToAPIDate(config.fromDate);
            config.returnDate = OBI.convertToAPIDate(config.toDate);

            var query = angular.copy(config);
            delete query.fromDate;
            delete query.toDate;
            return Search.flightSearch(query,
                angular.extend({}, this, {_id:undefined}), cb);
        };

        Search.lastResults = { data: {}, searchParams: {} };
        Search.previousLocation = "";

        Search.storeSearch = function (returnData, searchParams, type) {
            Search.lastResults.data[type] = returnData;
            Search.lastResults.searchParams = angular.extend({}, searchParams);
        };

        return Search;
    }]).
    factory("Hotel", ['$resource', function ($resource) {
        return $resource('/hotel/:chainCode/:hotelCode');
    }]).
    factory("Availability", ['$resource', function ($resource) {
        var Availability = $resource( OBI.rootUrl + '/hotel/available/:urlLocation', { }, {
            roomSearch: { method: "GET" }
        });

        Availability.rateToBook = {};
        Availability.hotelInfo = {};
        Availability.bookingNumbers = {};

        Availability.prototype.roomSearch = function (config, cb) {
            var _from = new Date(config.fromDate);
            config.from = _from.getFullYear() + "-" + (_from.getMonth() +1) + "-" + _from.getDate();
            var _to = new Date(config.toDate);
            config.to = _to.getFullYear() + "-" + (_to.getMonth() +1)  + "-" + _to.getDate();

            return Availability.roomSearch(config,
                angular.extend({}, this, {_id:undefined}), cb);
        };

        return Availability;
    }]).
    factory("Booking", ['$resource', function ($resource) {
        var Booking = $resource(OBI.rootUrl + '/hotel/reservation/make/:urlChannel');

        Booking.customerInfo = {};
        Booking.hotelInfo = {};

        Booking.storeHotelInfo = function (data) {
            Booking.hotelInfo = data;
        };

        Booking.storeBookingInfo = function (data) {
            Booking.customerInfo = data;
        };

        return Booking;
    }]).
    factory("TypeAheadAPI", ['$resource', function( $resource ) {
        // TODO: change to use an input var for country
        var TypeAheadAPI = $resource(OBI.rootUrl + '/locations/USA/');

        TypeAheadAPI.data = [];

        TypeAheadAPI.getIt = function (cb) {
            if (TypeAheadAPI.data.length <= 0) {
                TypeAheadAPI.get(function (data) {
                    if (data.locations) {
                        cb(data.locations);
                        TypeAheadAPI.data = data.locations;
                    }
                });
            } else {
                cb(TypeAheadAPI.data);
            }
        };

        return TypeAheadAPI;
    }]).
    factory("Contact", ['$resource', function( $resource ) {
        var Contact = $resource(OBI.rootUrl + '/contact/:email');
        return Contact;
    }]);
