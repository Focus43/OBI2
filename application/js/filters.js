
    /**
     * Sort an ngrepeat-er array of objects.
     * @note http://stackoverflow.com/questions/14478106/angularjs-sorting-by-property (more concise)
     */
    angular.module('obiWan').filter('orderObjectBy', function(){
        return function(input, attribute){
            if( !angular.isObject(input) ){ return input; }

            return input.sort(function(a, b){
                var _a = a[attribute].toLowerCase(), _b = b[attribute].toLowerCase();
                return (_a < _b) ? -1 : (_a > _b ? 1 : 0);
            });
        };
    });

    /**
     * Sort an ngrepeat-er array of hotels.
     * @note This si a hacks to deal w weird JSON formatting on the search results array
     */
    angular.module('obiWan').filter('orderResultsBy', function(){
        return function(input, attribute){
            if( !angular.isObject(input) || !attribute ){ return input; }

            return input.sort(function(a, b){
                var _a = a.hotel[attribute],
                    _b = b.hotel[attribute];

                if (typeof _a === 'string' || _a instanceof String) {
                    _a.toLowerCase();
                }

                if (typeof _b === 'string' || _b instanceof String) {
                    _b.toLowerCase();
                }

                return (_a < _b) ? -1 : (_a > _b ? 1 : 0);
            });
        };
    });

    /**
     * Format cc number to partially hidden.
     */
    angular.module('obiWan').filter('removePlusSign', function(){
        return function(input){
            var string = (input + '').trim();
            return string.replace("+", " ");
        };
    });

    /**
     * Format cc number to partially hidden.
     */
    angular.module('obiWan').filter('formatHiddenCC', function(){
        return function(input){
            var number = (input + '').trim();
            return 'xxxx-xxxx-xxx-' + number.substr(-4);
        };
    });

    /**
     * Format as a phone number (turn "1234567890" into "(123) 456-7890").
     */
    angular.module('obiWan').filter('formatPhone', function(){
        return function(input){
            var number = (input || '').trim().replace(/[^0-9]/g, '');
            return '(' + number.substr(0,3) + ') ' + number.substr(3,3) + '-' + number.substr(6,4);
        };
    });


    /**
     * Format a phone number suitable for a mobile telephone link.
     */
    angular.module('obiWan').filter('formatPhoneMobileLink', function(){
        return function(input){
            var number = (input || '').trim().replace(/[^0-9]/g, '');
            return number.substr(0,3) + '-' + number.substr(3,3) + '-' + number.substr(6,4);
        };
    });


    /**
     * Turn a string a handle format ("Any*909234!thing L*./,Ke This" -> anything-like-this")
     */
    angular.module('obiWan').filter('dasherize', function(){
        return function(input){
            return (input || '').replace(/[^a-z0-9\s]/gi,'').replace(' ', '-').toLowerCase();
        };
    });


    /**
     * Take an array of objects whereas an object contains { attribute: 'date string' },
     * and sort them.
     */
    angular.module('obiWan').filter('sortObjectByDate', function(){
        return function(input, attribute){
            if( !angular.isObject(input) ){ return input; }

            return input.sort(function(a, b){
                var _a = new Date(a[attribute]), _b = new Date(b[attribute]);
                return (_a < _b) ? -1 : (_a > _b ? 1 : 0);
            });
        };
    });


    angular.module('obiWan').filter('reverse', function(){
        return function (items){
            return (items || []).slice().reverse();
        };
    });
