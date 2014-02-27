/**
 * Created with RubyMine.
 * By: superrunt
 * Date: 2/27/14
 * Time: 1:12 PM
 */

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
