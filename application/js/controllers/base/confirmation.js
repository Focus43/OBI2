/**
 * Created with RubyMine.
 * By: superrunt
 * Date: 2/27/14
 * Time: 1:14 PM
 */

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