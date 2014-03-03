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
            console.log($rootScope.pageId);
            if ($rootScope.pageId === 'results-page') {
                return '/templates/hotel/_inc_sidebar_mobile.html';
            } else if ($rootScope.pageId === 'detail-page') {
                return '/templates/hotel/_inc_detailSidebar_mobile.html';
            } else {
                return '/templates/base/_inc_empty.html';
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
