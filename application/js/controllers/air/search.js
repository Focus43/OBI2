/**
 * Created with RubyMine.
 * By: superrunt
 * Date: 2/27/14
 * Time: 1:10 PM
 */
/**
 * Air Search controller
 */
obiWan.controller('AirSearchCtrl', ['$scope', '$rootScope', '$location', '$timeout', 'Search', 'TypeAheadAPI', function( $scope, $rootScope, $location, $timeout, Search, TypeAheadAPI ){

//    if ( $location.path() === "/external" ) {
//        $rootScope.pageId = 'external-search-page';
//        $rootScope.parentUrl = OBI.homeUrl;
//    } else {
//        $rootScope.pageId = 'search-page';
//    }

    TypeAheadAPI.getIt(function (data) {
        if (data) {
            $scope.typeAhead = data;
        }
    });

    // TODO: move to config?
//    var _keeperSearchData = [ 'location', 'fromDate', 'toDate' ];
//    $scope.searchParams = { };
//    if ( Search.lastResults.searchParams ) {
//        angular.forEach(_keeperSearchData, function ( param ) {
//            $scope.searchParams[param] = angular.copy(Search.lastResults.searchParams[param]);
//        });
//    }
//    if ( !$scope.searchParams.rooms ) {
//        $scope.searchParams.rooms = 1;
//    }
//    if ( !$scope.searchParams.child ) {
//        $scope.searchParams.child = 0;
//    }

    // Dates
//    $scope.updateToDate = function () {
//        if ( $scope.searchParams.toDate && ($scope.searchParams.toDate.valueOf() - $scope.searchParams.fromDate.valueOf() > 8640000 ) ) {
//            return;
//        }
//        var _newTo = $scope.searchParams.fromDate.valueOf() + (24*60*60*1000);
//        $scope.searchParams.toDate = _newTo;
//    };
//    $scope.toMinDate = $scope.searchParams.fromDate + (24*60*60*1000);

    $scope.searchFlights = function ( invalid ) {
//        if ( invalid ) { return; }

        if ( !$scope.searchParams.adults || $scope.searchParams.adults === 0 ) {
            $scope.searchParams.adults = 1;
        }

        if ( ! $scope.search ) {
            $scope.search = new Search();
        }
        $scope.search.flightSearch( $scope.searchParams, function (data) {
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
}]);