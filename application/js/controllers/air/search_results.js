/**
 * Created with RubyMine.
 * By: superrunt
 * Date: 2/27/14
 * Time: 1:11 PM
 */
/**
 * Results list controller
 */
obiWan.controller('AirResultsCtrl', ['$scope', '$rootScope', '$location', '$animate', '$routeParams', 'Search', 'TypeAheadAPI', function( $scope, $rootScope, $location, $animate, $routeParams, Search, TypeAheadAPI ){
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

//    if ( Search.lastResults && Object.keys(Search.lastResults.searchParams).length > 0 ) {
//        $scope.list = Search.lastResults.data.hotels.hotels;
//        $scope.searchParams = angular.extend({}, Search.lastResults.searchParams);
//    } else if ( $routeParams ) {
//        $scope.searchParams = $routeParams;
//        $scope.searchParams.rooms = parseInt($routeParams.rooms, 0);
//        _searchByRouteParams = true;
//    }

    // Date manipulation if url search
//    if ( typeof $scope.searchParams.from === "string" && !$scope.searchParams.fromDate ) {
//        $scope.searchParams.fromDate = OBI.validateAndConvertUrlDate($scope.searchParams.from);
//    }
//    if ( typeof $scope.searchParams.to === "string" && !$scope.searchParams.toDate ) {
//        $scope.searchParams.toDate = OBI.validateAndConvertUrlDate($scope.searchParams.to);
//    }

    if ( !$scope.searchParams.adult ) {
        $scope.searchParams.adult = 1;
    }
//    if ( !$scope.searchParams.distance ) {
//        $scope.searchParams.distance = OBI.defaultDistance;
//    }

//    $scope.searchParams.urlLocation = $scope.searchParams.location;

    $scope.searchFlights = function ( sorting, invalid ) {
//        if ( invalid ) { return; }

//        if ( sorting ) {
//            // check if filter type has been updated
//            // TODO: this is ugly! Move to method?
//            angular.forEach(OBI.filterSets, function ( params, type ) {
//
//                if ( type === $scope.previousFilterType) { return; }
//
//                var _hasNewFilterType = params.some( function( param ) {
//                    if ( $scope.searchParams[param] && $scope.searchParams[param] !== "" ) {
//                        $scope.currentFilterType = type;
//                        return true;
//                    }
//                });
//
//                if ( _hasNewFilterType ) {
//                    angular.forEach( OBI.filterSets, function ( paramArr, type ) {
//                        if (type === $scope.currentFilterType) { return; }
//                        // Only allow search params of current filter type
//                        angular.forEach( paramArr , function ( param ) {
//                            if ( $scope.searchParams[param] ) {
//                                delete $scope.searchParams[param];
//                            }
//                        });
//                    });
//                }
//            });
//            $scope.previousFilterType = $scope.currentFilterType;
//
//            // +1 rating because it's an array starting at 0
//            if ($scope.searchParams.ratings) { $scope.searchParams.ratings += 1; }
//        }

        if ( ! $scope.search ) {
            $scope.search = new Search();
        }
        $scope.search.flightSearch ( $scope.searchParams, function (data) {

//            if ( data.hotels && data.hotels.length > 0 ) {
//                // load the results list
//                $scope.list = data.hotels;
//                Search.storeSearch(data, $scope.searchParams, 'hotels');
//                $location.path("/hotels/" + $scope.searchParams.location + "/" + $scope.searchParams.from + "/" + $scope.searchParams.to + "/" + $scope.searchParams.rooms);
//            }else if ( data.suggestions && data.suggestions.length > 0 ) {
//                $scope.showSuggestions = true;
//                $scope.suggestions = data.suggestions;
//            } else {
//                if (data.Status && data.Status === "Failure") {
//                    if ( _searchByRouteParams ) {
//                        $location.path("/");
//                        $rootScope.errorMessage = 'Looks like that link doesn\'t work anymore. Try another search!';
//                    } else {
//                        var _msg = (data.Message) ? data.Message : "Sorry, there are no results for that search.";
//                        $rootScope.errorMessage = _msg;
//                    }
//                }
//                $rootScope.$broadcast('i-haz-error');
//                $rootScope.$broadcast('loading-complete');
//            }
            if ( data.hotels && data.hotels.length > 0 ) {
                Search.storeSearch(data, $scope.searchParams, 'air');
                // load the results list
                $location.path("/air/flights/" + $scope.searchParams.origin + "/" + $scope.searchParams.destination + "/" + $scope.searchParams.departure + "/" + $scope.searchParams.return );
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



    // in case user got here by pasting a url
    if ( _searchByRouteParams ) {
        $scope.searchFlights();
    }

}]);