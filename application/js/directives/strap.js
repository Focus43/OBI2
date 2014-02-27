/**
 * Created with RubyMine.
 * By: superrunt
 * Date: 2/27/14
 * Time: 11:40 AM
 */


/**
 * @note opens datepicker for related input field
 * sibling|parent option
 */
angular.module('obiWan').directive("openDatepicker", function () {
    return {
        restrict : "A",
        link : function(scope, element, attrs) {
            var _elm;
            // TODO: change to switch
            if ( attrs.openDatepicker === "sibling" ) {
                var _parent = element.parent();
                _elm = _parent.find('input');
            } else if ( attrs.openDatepicker === "parent" ) {
                _elm = element.parent();
            } else {
                _elm = element;
            }

            element.bind('click', function (e) {
                e.preventDefault();
                _elm[0].focus();
            });

        }
    };
});