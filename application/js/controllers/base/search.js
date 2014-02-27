/**
 * Created with RubyMine.
 * By: superrunt
 * Date: 2/27/14
 * Time: 1:10 PM
 */


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