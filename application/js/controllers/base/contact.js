/**
 * Created with RubyMine.
 * By: superrunt
 * Date: 2/27/14
 * Time: 1:15 PM
 */

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