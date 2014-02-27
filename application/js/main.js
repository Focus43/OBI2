    // IE8 fixes
    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function(obj, start) {
            for (var i = (start || 0), j = this.length; i < j; i++) {
                if (this[i] === obj) { return i; }
            }
            return -1;
        } ;
    }

    var OBI = {
        rootUrl: "https://dev-api.openbook.net/api/gds",
        homeUrl: "http://openbook.vpsdevsite.com/",
        defaultDistance: 5,
        resultsAtaTime: 20,
        channel: "WT",

        filterSets: {
            price: [ "priceLow", "priceHigh", "sortPrice" ],
            name: [ "sortName", "name" ]
        },

        convertToAPIDate: function ( date ) {
            var _conv = new Date(date);
            var _date = _conv.getDate().toString().length > 1 ? _conv.getDate() : "0"+_conv.getDate();
            return _conv.getFullYear() + "-" + (_conv.getMonth()+1) + "-" + _date;
        },

        validateAndConvertUrlDate: function ( dateStr ) {
            var _dateArr = dateStr.split("-");

            if ( _dateArr[1].length < 2 ) {
                _dateArr[1] = "0" + _dateArr[1];
            }
            if ( _dateArr[2].length < 2 ) {
                _dateArr[2] = "0" + _dateArr[2];
            }
            dateStr = _dateArr.join("-");
            var _str = dateStr + "T12:00:00";
            var _date= new Date (_str);
            return _date.valueOf();
        },

        initializeGMap: function () {

            var mapOptions = {
                zoom: 8,
                center: new google.maps.LatLng(-34.397, 150.644)
            };
            var mapHolster = document.getElementById('gmap');
            var map = new google.maps.Map(mapHolster,
                mapOptions);

            angular.element(mapHolster).html("");
        }
    };

    /**
     * OpenBook Intermediator.
     */

    var obiWan = angular.module('obiWan', ['ngResource', 'ngAnimate', 'ngTouch', 'openbookService', "mgcrea.ngStrap"]).run([ '$rootScope', '$location', '$anchorScroll', '$routeParams', function( $rootScope, $location, $anchorScroll, $routeParams ){

        $rootScope.pageId = '';

        // TODO: update html and css to handle the sidebar correctly instead
        $rootScope.mobileSidebarInclude = function () {
            console.log("mobileSidebarInclude");
            if ($rootScope.pageId === 'results-page') {
                return '/_inc_sidebar_mobile.html';
            } else if ($rootScope.pageId === 'detail-page') {
                return '/_inc_detailSidebar_mobile.html';
            } else {
                return '/_inc_empty.html';
            }
        };

        // TODO: helper methods should be moved to angular.module('obiWan.helpers') or something
        // SCROLL TO
        $rootScope.scrollPageToId = function (str) {
            var target = document.getElementById(str);
            document.body.scrollTop = target.offsetTop;
        };

        $rootScope.openLiveChat = function (evt) {
            evt.preventDefault();
            SnapEngage.startLink();
        };

        $rootScope.missingFeature = function () {
            var _fadeOut = function () {
                $rootScope.$broadcast("i-haz-nomore-error");
            };

            if ($location.path() === "/") {
                $rootScope.errorMessage = "This feature is coming soon. Please, check back soon!";
                $rootScope.$broadcast("i-haz-error");
            }  else {
                $location.path("/");
                var deregister = $rootScope.$on('$routeChangeSuccess', function() {
                    $rootScope.errorMessage = "This feature is coming soon. Please, check back soon!";
                    $rootScope.$broadcast("i-haz-error");
                    deregister();
                });
            }
            setTimeout(_fadeOut, 3000);
        };

        $rootScope.$on('$routeChangeSuccess', function(newRoute, oldRoute) {
            $location.hash($routeParams.scrollTo);
            $anchorScroll();
        });

        $rootScope.session = null;
    }]);

    /**
     * $http interceptor mixin to obiWan
     */
    obiWan.config(function($httpProvider) {

        $httpProvider.interceptors.push(function($q, $rootScope) {
            return {
                'request': function(config) {
                    if ( config.params ) {
                        config.params.session = $rootScope.session;
                        config.params.channel = OBI.channel;
                    } else {
                        config.params = { session: $rootScope.session, channel: OBI.channel };
                    }

                    $rootScope.$broadcast('loading-started');
                    return config || $q.when(config);
                },
                'requestError': function(rejection) {
                    $rootScope.$broadcast('request-error');
                    return $q.reject(rejection);
                },
                'response': function(response) {
                    if ( response.data && response.data.session ) {
                        $rootScope.session = response.data.session;
                    }
                    $rootScope.$broadcast('loading-complete');
                    return response || $q.when(response);
                },
                'responseError': function(rejection) {
                    $rootScope.$broadcast('response-error');
                    return $q.reject(rejection);
                }
            };
        });
    });


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
                .when('/hotels/:location/:from/:to/:rooms', {templateUrl: 'templates/hotel/_list.html', controller: 'ResultsCtrl'})
                .when('/detail/:providerCode/:chainId/:hotelId/:from/:to', {templateUrl: 'templates/hotel/_hotel_detail.html', controller: 'HotelDetailCtrl'})
                .when('/checkout', {templateUrl: '/_checkout.html', controller: 'BookingCtrl'})
                .when('/thankyou/:confirmation', {templateUrl: 'templates/hotel/_thankyou.html', controller: 'ConfirmationCtrl'})
                .when('/contact', {templateUrl: 'base/_contact.html', controller: 'ContactCtrl'})
                .when('/external', {templateUrl: 'templates/hotel/_searchembed.html', controller: 'SearchCtrl'})
                .when('/faq', {templateUrl: 'templates/base/_faq.html', controller: 'StaticCtrl'})
                .when('/privacy', {templateUrl: 'templates/base/_privacy.html', controller: 'StaticCtrl'})
                .otherwise({redirectTo: '/'});
        }]).
        factory('Search', ['$resource', function( $resource ) {
            var Search = $resource( OBI.rootUrl + '/hotels/location/:urlLocation', { urlLocation:'@location' }, {
                hotelSearch: { method: "GET" }
            });

            Search.prototype.hotelSearch = function (config, cb) {
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


    /**
     * Search controller
     */
    obiWan.controller('SearchCtrl', ['$scope', '$rootScope', '$location', '$timeout', 'Search', 'TypeAheadAPI', function( $scope, $rootScope, $location, $timeout, Search, TypeAheadAPI ){

        if ( $location.path() === "/external" ) {
            $rootScope.pageId = 'external-search-page';
            $rootScope.parentUrl = OBI.homeUrl;
        } else {
            $rootScope.pageId = 'search-page';
        }

        TypeAheadAPI.getIt(function (data) {
            if (data) {
                $scope.typeAhead = data;
            }
        });

        // TODO: move to config?
        var _keeperSearchData = [ 'location', 'fromDate', 'toDate' ];
        $scope.searchParams = { };
        if ( Search.lastResults.searchParams ) {
            angular.forEach(_keeperSearchData, function ( param ) {
                $scope.searchParams[param] = angular.copy(Search.lastResults.searchParams[param]);
            });
        }
        if ( !$scope.searchParams.rooms ) {
            $scope.searchParams.rooms = 1;
        }
        if ( !$scope.searchParams.child ) {
            $scope.searchParams.child = 0;
        }

        // Dates
        $scope.updateToDate = function () {
            if ( $scope.searchParams.toDate && ($scope.searchParams.toDate.valueOf() - $scope.searchParams.fromDate.valueOf() > 8640000 ) ) {
                return;
            }
            var _newTo = $scope.searchParams.fromDate.valueOf() + (24*60*60*1000);
            $scope.searchParams.toDate = _newTo;
        };
        $scope.toMinDate = $scope.searchParams.fromDate + (24*60*60*1000);

        $scope.searchHotels = function ( invalid ) {
            if ( invalid ) { return; }

            $scope.searchParams.urlLocation = $scope.searchParams.location;

            if ( !$scope.searchParams.distance ) {
                $scope.searchParams.distance = OBI.defaultDistance;
            }

            if ( ! $scope.search ) {
                $scope.search = new Search();
            }
            $scope.search.hotelSearch( $scope.searchParams, function (data) {

                if ( data.hotels && data.hotels.length > 0 ) {
                    Search.storeSearch(data, $scope.searchParams, 'hotels');
                    // load the results list
                    $location.path("/hotels/" + $scope.searchParams.location + "/" + $scope.searchParams.from + "/" + $scope.searchParams.to + "/" + $scope.searchParams.rooms );
                } else if ( data.suggestions && data.suggestions.length > 0 ) {
                    $scope.showSuggestions = true;
                    $scope.suggestions = data.suggestions;
                } else if ( data.Status && data.Status === "Failure") {
                    $scope.errorMessage = data.Message;
                    $rootScope.$broadcast('i-haz-error');
                } else {
                    $scope.errorMessage = 'Sorry: Something went wrong with this search.';
                    $rootScope.$broadcast('i-haz-error');
                }
            });
        };
    }]);

    /**
     * Results list controller
     */
    obiWan.controller('ResultsCtrl', ['$scope', '$rootScope', '$location', '$animate', '$routeParams', 'Search', 'TypeAheadAPI', function( $scope, $rootScope, $location, $animate, $routeParams, Search, TypeAheadAPI ){
        var _searchByRouteParams = false;
        $scope.previousFilterType = "";
        $scope.currentFilterType = "";

        $rootScope.pageId = 'results-page';

        $scope.results = {
            lazyCount: 10
        };

        $scope.updateToDate = function () {
            if ( $scope.searchParams.toDate && ($scope.searchParams.toDate.valueOf() - $scope.searchParams.fromDate.valueOf() > 8640000 ) ) {
                return;
            }
            var _newTo = $scope.searchParams.fromDate.valueOf() + (24*60*60*1000);
            $scope.searchParams.toDate = _newTo;
        };

        TypeAheadAPI.getIt(function (data) {
            if (data) {
                $scope.typeAhead = data;
            }
        });

        if ( Search.lastResults && Object.keys(Search.lastResults.searchParams).length > 0 ) {
            $scope.list = Search.lastResults.data.hotels.hotels;
            $scope.searchParams = angular.extend({}, Search.lastResults.searchParams);
        } else if ( $routeParams ) {
            $scope.searchParams = $routeParams;
            $scope.searchParams.rooms = parseInt($routeParams.rooms, 0);
            _searchByRouteParams = true;
        }

        // Date manipulation if url search
        if ( typeof $scope.searchParams.from === "string" && !$scope.searchParams.fromDate ) {
            $scope.searchParams.fromDate = OBI.validateAndConvertUrlDate($scope.searchParams.from);
        }
        if ( typeof $scope.searchParams.to === "string" && !$scope.searchParams.toDate ) {
            $scope.searchParams.toDate = OBI.validateAndConvertUrlDate($scope.searchParams.to);
        }

        if ( !$scope.searchParams.adult ) {
            $scope.searchParams.adult = 1;
        }
        if ( !$scope.searchParams.distance ) {
            $scope.searchParams.distance = OBI.defaultDistance;
        }

        $scope.searchParams.urlLocation = $scope.searchParams.location;

        $scope.searchHotels = function ( sorting, invalid ) {
            if ( invalid ) { return; }

            if ( sorting ) {
                // check if filter type has been updated
                // TODO: this is ugly! Move to method?
                angular.forEach(OBI.filterSets, function ( params, type ) {

                    if ( type === $scope.previousFilterType) { return; }

                    var _hasNewFilterType = params.some( function( param ) {
                        if ( $scope.searchParams[param] && $scope.searchParams[param] !== "" ) {
                            $scope.currentFilterType = type;
                            return true;
                        }
                    });

                    if ( _hasNewFilterType ) {
                        angular.forEach( OBI.filterSets, function ( paramArr, type ) {
                            if (type === $scope.currentFilterType) { return; }
                            // Only allow search params of current filter type
                            angular.forEach( paramArr , function ( param ) {
                                if ( $scope.searchParams[param] ) {
                                    delete $scope.searchParams[param];
                                }
                            });
                        });
                    }
                });
                $scope.previousFilterType = $scope.currentFilterType;

                // +1 rating because it's an array starting at 0
                if ($scope.searchParams.ratings) { $scope.searchParams.ratings += 1; }
            }

            if ( ! $scope.search ) {
                $scope.search = new Search();
            }
            $scope.search.hotelSearch ( $scope.searchParams, function (data) {

                if ( data.hotels && data.hotels.length > 0 ) {
                    // load the results list
                    $scope.list = data.hotels;
                    Search.storeSearch(data, $scope.searchParams, 'hotels');
                    $location.path("/hotels/" + $scope.searchParams.location + "/" + $scope.searchParams.from + "/" + $scope.searchParams.to + "/" + $scope.searchParams.rooms);
                }else if ( data.suggestions && data.suggestions.length > 0 ) {
                    $scope.showSuggestions = true;
                    $scope.suggestions = data.suggestions;
                } else {
                    if (data.Status && data.Status === "Failure") {
                        if ( _searchByRouteParams ) {
                            $location.path("/");
                            $rootScope.errorMessage = 'Looks like that link doesn\'t work anymore. Try another search!';
                        } else {
                            var _msg = (data.Message) ? data.Message : "Sorry, there are no results for that search.";
                            $rootScope.errorMessage = _msg;
                        }
                    }
                    $rootScope.$broadcast('i-haz-error');
                    $rootScope.$broadcast('loading-complete');
                }
            });
        };

        $scope.HiLo = [{param: "high", name: "High to Low"}, {param: "low", name: "Low to High"}];

        $scope.amenities = {};
        $scope.amenities.list = [
//            { code: "HSPI", name: "High Speed Internet" },
            { code: "POOL", name: "Pool" },
            { code: "COBR", name: "Continental Breakfast" },
            { code: "FRTR", name: "Free Transportation" },
            { code: "SPAL", name: "Pet Friendly" },
            { code: "HECL", name: "Fitness Center" },
            { code: "FPRK", name: "Free Parking" },
            { code: "MEFA", name: "Meeting Facilities" },
            { code: "NSMR", name: "Non-smoking" },
            { code: "CBTV", name: "Cable TV" },
            { code: "PRBT", name: "Private Bath" }
        ];

        $scope.amenities.numToShowInAmenList = 6;
        $scope.amenities.amenitiesPredicate = null;

        // Calendar popup
        var _min = new Date();
        $scope.fromMinDate = _min.setUTCHours(12,0,0);
        $scope.toMinDate = $scope.fromMinDate + (24*60*60*1000);

        $scope.dateOptions = {
            'year-format': "'yy'",
            'starting-day': 1
        };
        $scope.format = 'MM/dd/yyyy';

        // in case user got here by pasting a url
        if ( _searchByRouteParams ) {
            $scope.searchHotels();
        }

    }]);

    /**
     * Hotel Detail controller
     */
    obiWan.controller('HotelDetailCtrl', ['$scope', '$rootScope', '$routeParams', '$location', '$window', '$animate', '$swipe', '$anchorScroll', 'Availability', 'Search', function($scope, $rootScope, $routeParams, $location, $window, $anchorScroll, $animate, $swipe, Availability, Search) {

        $rootScope.pageId = 'detail-page';

        var _hotelId = $routeParams.hotelId;
        var _chainId = $routeParams.chainId;
        var _count = 0;
        var _noPreviousData = false;

        if ( Search.lastResults && Object.keys(Search.lastResults.searchParams).length > 0 ) {

//            $scope.list = Search.lastResults.data.hotels.hotels;
            $scope.searchParams = angular.extend({}, Search.lastResults.searchParams);

            // get current hotel
            if ( Search.lastResults && Search.lastResults.data.hotels && Search.lastResults.data.hotels.hotels ) {
                _count = Search.lastResults.data.hotels.hotels.length;
                for (var i = 0; i < _count; i++) {
                    if (Search.lastResults.data.hotels.hotels[i].hotel.hotelCode === _hotelId && Search.lastResults.data.hotels.hotels[i].hotel.hotelChain === _chainId ) {
                        $scope.hotel = Search.lastResults.data.hotels.hotels[i].hotel;
                        break;
                    }
                }
            } else if ( Search.lastResults && Search.lastResults.data.rooms.hotel ) {
                $scope.hotel = Search.lastResults.data.rooms.hotel.property || {};
            }

//            if ( !$scope.hotel ) {
//                // reload
//                var _currentPath = $location.path() ;
//                $location.path(_currentPath);
//            }

            _noPreviousData = false;

        } else if ( $routeParams ) {
            $scope.searchParams = $routeParams;
            _noPreviousData = true;
        }

        // Date manipulation if url search
        if ( typeof $scope.searchParams.from === "string" && !$scope.searchParams.fromDate ) {
            $scope.searchParams.fromDate = OBI.validateAndConvertUrlDate($scope.searchParams.from);
        }
        if ( typeof $scope.searchParams.to === "string" && !$scope.searchParams.toDate ) {
            $scope.searchParams.toDate = OBI.validateAndConvertUrlDate($scope.searchParams.to);
        }

        $scope.updateToDate = function () {
            if ( $scope.searchParams.toDate && ($scope.searchParams.toDate.valueOf() - $scope.searchParams.fromDate.valueOf() > 8640000 ) ) {
                return;
            }
            var _newTo = $scope.searchParams.fromDate.valueOf() + (24*60*60*1000);
            $scope.searchParams.toDate = _newTo;
        };

        $scope.getAvailableRooms = function (invalid) {

            if (invalid) { return; }

            $scope.searchParams.rooms = $scope.searchParams.rooms ? $scope.searchParams.rooms : 1;
            $scope.searchParams.adult = $scope.searchParams.adult ? $scope.searchParams.adult : 1;

            var _availabilityQuery = {
                provider: $scope.searchParams.providerCode || $scope.hotel.providerCode,
                chain: _chainId,
                code: _hotelId,
                rooms: $scope.searchParams.rooms,
                fromDate: $scope.searchParams.fromDate,
                toDate: $scope.searchParams.toDate,
                urlLocation: $scope.searchParams.location ? $scope.searchParams.location : "undefined"
            };

            if ( $scope.searchParams.adult ) {
                _availabilityQuery.adult = $scope.searchParams.adult;
            } else {
                _availabilityQuery.adult = 1;
            }

            if ( $scope.searchParams.child ) {
                _availabilityQuery.child = $scope.searchParams.child;
            }

            // get available rooms and hotel images
            if ( ! $scope.availability ) {
                $scope.availability = new Availability();
            }
            $scope.availability.roomSearch( _availabilityQuery, function (data) {

                if ( data.Status && data.Status === "Failure" ) {
                    $scope.errorMessage = data.Message;
                    if (_noPreviousData) {
                        $rootScope.errorMessage = 'Looks like that link doesn\'t work anymore. Try another search!';
                        $location.path("/");
                    } else {
                        var _msg = (data.Message) ? data.Message : "Sorry, there are no results for that search.";
                        $scope.errorMessage = _msg;
                    }
                    $rootScope.$broadcast("i-haz-error");
                } else if ( data.hotel && data.hotel.rates )  {
                    Search.storeSearch(data, $scope.searchParams, 'rooms');
                    $scope.rooms = data.hotel.rates;
                    $scope.media = data.hotel.media.medium.length > 0 ? data.hotel.media.medium : data.hotel.media.large;
                    $scope.hotel = data.hotel.property;
                    if (_noPreviousData) {
                        $rootScope.$broadcast("i-haz-latlong");
                    }
                    $location.path("/detail/" + _availabilityQuery.provider + "/" + _availabilityQuery.chain + "/" + _availabilityQuery.code + "/" + $scope.searchParams.from + "/" + $scope.searchParams.to );
                }
            });
        };
        // Get rooms if new search
        if ( !Search.lastResults.data.rooms || Search.lastResults.data.rooms.hotel.property.hotelCode !== _hotelId ) {
            $scope.getAvailableRooms();
        } else {
            $scope.rooms = Search.lastResults.data.rooms.hotel.rates;
            $scope.media = Search.lastResults.data.rooms.hotel.media.medium.length > 0 ? Search.lastResults.data.rooms.hotel.media.medium : Search.lastResults.data.rooms.hotel.media.large;
            $scope.hotel = Search.lastResults.data.rooms.hotel.property;
        }

        $scope.openDetailIdxs = [];

        $scope.amenityLimit = function (idx) {
            if ($scope.openDetailIdxs.length === 0) {
                return 8;
            } else {
                if ( $scope.openDetailIdxs.indexOf(idx) !== -1 ) {
                    return 99;
                } else {
                    return 8;
                }
            }
        };
        // TODO: should move to a directive
        $scope.toggleDetails = function ( idx, evt ) {
            var _index = $scope.openDetailIdxs.indexOf(idx);
            if ( _index === -1 ) {
                $scope.openDetailIdxs.push(idx);
                angular.element(evt.currentTarget).html("Hide Details");
            } else {
                $scope.openDetailIdxs.splice( _index, 1 );
                angular.element(evt.currentTarget).html("Show Details");
            }
        };

        $scope.goBookThis = function (room) {
            Availability.bookingNumbers = {
                adult: Search.lastResults.searchParams.adult,
                child: Search.lastResults.searchParams.child || 0,
                from: Search.lastResults.searchParams.from,
                to: Search.lastResults.searchParams.to,
                rooms: Search.lastResults.searchParams.rooms
            };
            Availability.rateToBook = room;
            Availability.hotelInfo = $scope.hotel;
            $location.path('/checkout');
        };

        // Calendar popup
        var _min = new Date();
        $scope.fromMinDate = _min.setUTCHours(0,0,0);
        $scope.toMinDate = _min.setDate(_min.getDate()+1);
        $scope.dateOptions = {
            'year-format': "'yy'",
            'starting-day': 1
        };
        $scope.format = 'MM/dd/yyyy';

        // SLIDE STUFF

            // TODO: move all this to directives
        $scope.direction = 'left';
        $scope.currentIndex = 0;

        $scope.setCurrentSlideIndex = function (index) {
            $scope.direction = (index > $scope.currentIndex) ? 'left' : 'right';
            $scope.currentIndex = index;
        };

        $scope.isCurrentSlideIndex = function (index) {
            return $scope.currentIndex === index;
        };

        $scope.prevSlide = function () {
            $scope.direction = 'left';
            $scope.currentIndex = ($scope.currentIndex < $scope.media.length - 1) ? ++$scope.currentIndex : 0;
        };

        $scope.nextSlide = function () {
            $scope.direction = 'right';
            $scope.currentIndex = ($scope.currentIndex > 0) ? --$scope.currentIndex : $scope.slides.length - 1;
        };

    }])
        .animation('.slide-animation', function () {
            return {
                addClass: function (element, className, done) {
                    var scope = element.scope();

                    if (className === 'ng-hide') {
                        var finishPoint = element.parent().width();
                        if(scope.direction !== 'right') {
                            finishPoint = -finishPoint;
                        }
                        TweenMax.to(element, 0.5, {left: finishPoint, onComplete: done });
                    }
                    else {
                        done();
                    }
                },
                removeClass: function (element, className, done) {
                    var scope = element.scope();

                    if (className === 'ng-hide') {
                        element.removeClass('ng-hide');

                        var startPoint = element.parent().width();
                        if(scope.direction === 'right') {
                            startPoint = -startPoint;
                        }

                        TweenMax.set(element, { left: startPoint });
                        TweenMax.to(element, 0.5, {left: 0, onComplete: done });
                    }
                    else {
                        done();
                    }
                }
            };
        });

    /**
     * Booking controller
     */
    obiWan.controller('BookingCtrl', ['$scope', '$http', '$location', '$rootScope', 'Booking', 'Search', 'Availability', function($scope, $http, $location, $rootScope, Booking, Search, Availability){
        $rootScope.pageId = 'booking-page';

        if ( !$rootScope.session || $rootScope.session === "" ) {
            $location.path("/");
        }

        $scope.rate = Availability.rateToBook;
        $scope.hotelInfo = Availability.hotelInfo;
        $scope.bookingInfo = Availability.bookingNumbers;
        $scope.searchParams = Search.lastResults.searchParams;

        $scope.cardTypes =  $scope.rate.rateRules.creditCards;

        $scope.nights = 0;
        if (Search.lastResults.searchParams.toDate && Search.lastResults.searchParams.fromDate) {
            $scope.nights = Math.ceil((Search.lastResults.searchParams.toDate - Search.lastResults.searchParams.fromDate) / (1000*60*60*24) );
            var _toDate = new Date(Search.lastResults.searchParams.toDate);
            var _fromDate = new Date(Search.lastResults.searchParams.fromDate);
            $scope.bookingInfo.to = _toDate.getFullYear() + "-" + (_toDate.getMonth()+1) + "-" + _toDate.getDate();
            $scope.bookingInfo.from = _fromDate.getFullYear() + "-" + (_fromDate.getMonth()+1) + "-" + _fromDate.getDate();

        } else if ($scope.bookingInfo.from && $scope.bookingInfo.to) {
            var _from = new Date($scope.bookingInfo.from);
            var _to = new Date($scope.bookingInfo.to);
            $scope.nights = (_to - _from) / (1000*60*60*24);
        }
        $scope.booking = {
            token: $scope.rate.paymentInfo.token,
            ratePlan: $scope.rate.ratePlan,
            providerCode: $scope.hotelInfo.providerCode,
            chain: $scope.hotelInfo.hotelChain,
            code: $scope.hotelInfo.hotelCode,
            location: $scope.hotelInfo.location.searchLocation,
            name: $scope.hotelInfo.name,
            category: $scope.rate.category,
            roomType: $scope.rate.name,
            price: $scope.rate.paymentInfo.price,
            total: $scope.rate.paymentInfo.total,
            deposit: $scope.rate.paymentInfo.deposit,
            prepay: $scope.rate.paymentInfo.prepay,
            guarantee: $scope.rate.paymentInfo.guarantee,
            tax: $scope.rate.paymentInfo.tax,
            currency: $scope.rate.paymentInfo.currency,
            from: $scope.bookingInfo.from,
            to: $scope.bookingInfo.to,
            rooms: $scope.bookingInfo.rooms,
            adult: $scope.bookingInfo.adult,
            child: $scope.bookingInfo.child || 0
        };

        $scope.bookNow = function ( invalid ) {

            if ( invalid ) {
                $scope.errorMessage = "Please, fill out all the required fields.";
                $rootScope.$broadcast("i-haz-error");
                return;
            }

            $scope.booking.ccExpiration = $scope.booking.ccYear + "-" + $scope.booking.ccMonth;
            $scope.booking.urlChannel = OBI.channel;
            if ( typeof $scope.searchParams.from !== 'string' ) {
                var _from = new Date($scope.searchParams.from);
                $scope.searchParams.from = _from.getFullYear() + "-" + (_from.getMonth()+1) + "-" + _from.getDate();
            }
            if ( typeof $scope.searchParams.to !== 'string' ) {
                var _to = new Date($scope.searchParams.to);
                $scope.searchParams.to = _to.getFullYear() + "-" + (_to.getMonth()+1) + "-" + _to.getDate();
            }
            Booking.get( $scope.booking, function ( data ) {
                if ( data.Status && data.Status === "Success" ) {
                    Search.storeSearch(data, $scope.searchParams, "booking");
                    Booking.storeBookingInfo($scope.booking);
                    Booking.storeHotelInfo($scope.hotelInfo);
                    $location.path("/thankyou/" + data.Confirmation);
                } else if ( data.Status && data.Status === "Failure" ) {
                    $scope.errorMessage = data.Message;
                    $rootScope.$broadcast("i-haz-error");
                }
            });
        };
    }]);

    /**
     * Confirmation controller
     */
    obiWan.controller('ConfirmationCtrl', ['$scope', '$http', '$location', '$routeParams', '$rootScope', 'Booking', function($scope, $http, $location, $routeParams, $rootScope, Booking) {
        $rootScope.pageId = 'confirmation-page';

        $scope.res = Booking.customerInfo;
        $scope.res.reservDate = new Date();
        $scope.hotel = Booking.hotelInfo;
        $scope.confirmation = $routeParams.confirmation;

        $rootScope.session = "";
    }]);

    /**
     * Contact controller
     */
    obiWan.controller('ContactCtrl', ['$scope', '$http', '$location', '$rootScope', 'Contact', function($scope, $http, $location, $rootScope, Contact){
        $rootScope.pageId = 'contact-page';

        $scope.sendMessage = function ( invalid ) {

            if ( invalid ) { return; }

            Contact.get( $scope.contact, function ( data ) {
                if ( data.Status && data.Status === "Success" ) {
                    $rootScope.$broadcast("i-haz-success");
                    $scope.successMessage = data.Message;
                    $scope.contact = {};
                } else if ( data.Status && data.Status === "Failure" ) {
                    $scope.errorMessage = data.Message;
                    $rootScope.$broadcast("i-haz-error");
                }
            });
        };
    }]);

    /**
     * Contact controller
     */
    obiWan.controller('StaticCtrl', ['$scope', '$rootScope', function($scope, $rootScope){
        $rootScope.pageId = 'static-page';

    }]);