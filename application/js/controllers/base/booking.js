/**
 * Created with RubyMine.
 * By: superrunt
 * Date: 2/27/14
 * Time: 1:12 PM
 */
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