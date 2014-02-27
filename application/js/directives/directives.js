
    // GENERIC DIRECTIVES
    /**
     * @note Corresponds to <el toggle-class="selector,class-to-toggle" />
     */
    angular.module('obiWan').directive('toggleClass', function(){
        return function(scope, element, attrs){
            element.bind('click', function(e){
                var selector_class = attrs.toggleClass.split(',');
                angular.element( document.querySelectorAll(selector_class[0]) )
                    .toggleClass(selector_class[1]);
            });
        };
    });

    angular.module('obiWan').directive("hideparent", function() {
        return function(scope, element, attrs) {
            element.bind('click', function(){
                element.parent().addClass("invisible");
            });
        };
    });

    angular.module('obiWan').directive('toggleSiblingVisibility', function(){
        return function(scope, $element, attr){
            $element.on('click', function(){
                $element.siblings(attr).toggle();
            });
        };
    });

    /**
     * @note shows 'thinking' modal
     */
    angular.module('obiWan').directive("loading", function() {
        return {
            restrict : "A",
            link : function(scope, element, attrs) {
                scope.reqCount = 0;
                scope.respCount = 0;

                scope.$on("loading-started", function(e) {
                    scope.reqCount ++;
                    element.removeClass("hide");
                });
                scope.$on("loading-complete", function(e) {
                    scope.respCount ++;
                    if (scope.respCount >= scope.reqCount) {
                        element.addClass("hide");
                    }
                });
                scope.$on("request-error", function(e) {
                    console.log("-------- request-error -------------");
                });
                scope.$on("response-error", function(e) {
                    console.log("---------- response-error -------------");
                });
            }
        };
    });

    /**
     * @note error messages
     */
    angular.module('obiWan').directive("errormsg", function() {
        return {
            restrict : "A",
            link : function(scope, element, attrs) {

                var _fadeOut = function() {
                    element.addClass('invisible');
                };

                scope.$on("i-haz-error", function() {
                    element.removeClass('invisible');
                    var _errstr = (scope.errorMessage) ? scope.errorMessage : "Oops! Something went wrong";
                    element.find("span").html(_errstr);
                    if (attrs['scrollToMe'] && attrs['scrollToMe']) {
                        element[0].scrollIntoView();
                    }
                    if (attrs['fadeItOut']) {
                        setTimeout(_fadeOut(), 3000);
                    }
                });

                scope.$on("i-haz-nomore-error", function() {
                    element.addClass('invisible');
                });
            }
        };
    });

    /**
     * @note info messages
     */
    angular.module('obiWan').directive("successmsg", function() {
        return {
            restrict : "A",
            link : function(scope, element, attrs) {
                scope.$on("i-haz-success", function() {
                    element.toggleClass('invisible');
                    var _errstr = (scope.successMessage) ? scope.successMessage : "Success!";
                    element.find("span").html(_errstr);
                });
            }
        };
    });

    /**
     * @note scroll to top invalid element in form
     */
    angular.module('obiWan').directive('scrollToInvalid', function () {
        return function (scope, element, attributes) {
            element.bind('click', function () {
                var _form = (attributes['parentForm']) ? document.getElementsByName(attributes['parentForm']) : document.getElementsByTagName("form");
                if ( !(angular.element(_form)).hasClass('ng-invalid') ) { return; }

                var _scrollToElm = _form[0].getElementsByClassName("ng-invalid-required");
                if ( _scrollToElm.length < 1 ) { _scrollToElm = _form[0].getElementsByClassName("ng-invalid"); }

                for (var i = 0; i < _scrollToElm.length; ++i) {
                    angular.element(_scrollToElm[i]).addClass("fixme");
                }

                setTimeout(function () {
                    window.scrollTo(0, _scrollToElm[0].offsetTop - 100);
                }, 20);
            });
        };
    });

    /**
     * @note diable a tags
     */
    angular.module('obiWan').directive('aDisabled', ['$compile', function ($compile) {
        return {
            restrict: 'A',
            priority: -99999,
            link: function (scope, element, attrs) {
                var noClick = function (e) {
                    e.preventDefault();
                    angular.element( element[0].offsetParent.querySelectorAll('input')).addClass('fixme');
                };

                scope.$watch(
                    function() { return attrs.aDisabled; },
                    function (val, oldval) {
                        if ( !val || val === "false" ) {
                            element.bind('click', noClick);
                        } else if (val && val === "true") {
                            element.unbind('click', noClick);
                        }
                    }
                );
            }
        };
    }]);

    // APP SPECIFIC DIRECTIVES

    /**
     * @note display content in modal
     */
    angular.module('obiWan').directive("showModalContent", [ "displayMap", "$http", "$compile", function(displayMap, $http, $compile) {
        return {
            restrict : "A",
            link : function(scope, element, attrs) {
                element.bind("click", function() {
                    angular.element( document.querySelectorAll("#modal-overlay #modal-content #dynamic-content")).html("");
                    angular.element( document.querySelectorAll("#modal-overlay #modal-content #dynamic-content")).removeClass("map");
                    angular.element( document.querySelectorAll("#modal-overlay") ).toggleClass('invisible');

                    if ( attrs["showModalContent"] === "map" ) {
                        if (scope.item.hotel) {
                            var _dynCont = angular.element( document.querySelectorAll("#modal-overlay #modal-content #dynamic-content"));
                            var _mapDiv = angular.element("<div class='wrapper'></div>");
                            _dynCont.addClass("map");
                            _dynCont.append(_mapDiv);

                            displayMap( _mapDiv, scope.item.hotel);
                        } else {
                            angular.element( document.querySelectorAll("#modal-overlay #modal-content #dynamic-content") ).html("Sorry, no map is available for this hotel.");
                        }
                    } else if ( attrs["includePath"] ) {
                        $http({method: 'GET', url: attrs["includePath"]}).
                            success(function(data, status, headers, config) {
                                var _modal = angular.element( document.querySelectorAll("#modal-overlay #modal-content #dynamic-content") );
                                var _element;

                                if (attrs["preCompile"] === 'true') {
                                    var _html = data;
                                    _element = $compile( _html )( scope );
                                } else {
                                    _element = data;
                                }

                                _modal.html(_element);
                            }).
                            error(function(data, status, headers, config) {
                                angular.element( document.querySelectorAll("#modal-overlay #modal-content #dynamic-content") ).html("Sorry, no data avilable.");
                            });
                    } else {
                        angular.element( document.querySelectorAll("#modal-overlay #modal-content #dynamic-content") ).html(attrs["showModalContent"]);
                    }
                });
            }
        };
    }]);

    /**
     * @note lazy load
     */
    angular.module('obiWan').directive("lazyLoad", function() {
        return {
            restrict : "A",
            link : function(scope, element, attrs) {
                window.onscroll = function (e) {
                    if ( element.context.scrollHeight - window.pageYOffset < 340 ) {
//                        angular.element( document.querySelectorAll("#loadingMore") ).toggleClass("invisible");
                        scope.$apply( function () {
                            scope.results.lazyCount += 10;
                        });
                    }
                };
            }
        };
    });

    /**
     * @note full screen home page
     */
    // TODO: change to not use jquery
    angular.module('obiWan').directive("fullScreen", function() {
        return {
            restrict : "A",
            link : function(scope, element, attrs) {
                    var contentHeight = window.outerHeight - document.getElementById('ob-fixedheader').offsetHeight;
                    element.css('height', contentHeight - 60 + "px");
                }
            };
    });

    /**
     * @note open/close  filter bar
     */
    angular.module('obiWan').directive("showFilterOptions", function() {
        return function(scope, element, attrs) {

            var _showHideElm = angular.element( document.querySelectorAll("#filterDetails .optionList_" + attrs.showFilterOptions) );

            var _hideFilters =  function ( ) {
                _showHideElm.removeClass("visible");
                angular.element( document.querySelectorAll("ul.results-list")).css("marginTop", "0px") ;
                element.removeClass("active");
            };

            var _showFilters = function () {
                angular.element( document.querySelectorAll(".filterOption button.filterbtn") ).removeClass("active");
                angular.element( document.querySelectorAll("#filterDetails div.visible") ).removeClass("visible");
                _showHideElm.addClass("visible");
                element.addClass("active");
                angular.element( document.querySelectorAll("ul.results-list")).css("marginTop", "40px") ;
            };

            element.bind('click', function() {
                if (  _showHideElm.hasClass("visible") ) {
                    _hideFilters();
                } else {
                    _showFilters();

                    _showHideElm.find("select").bind('change', function () {
                        scope.searchHotels(true);
                        _hideFilters();
                    });
                }
            });

        };
    });

    /**
     * @note select sidebar filters on load
     */
    angular.module('obiWan').directive("checkForCheck", function () {
        return {
            restrict : "A",
            link : function(scope, element, attrs) {

                if  (attrs.parentScope) {
                    scope =  attrs.parentScope;
                }

                var _foundIt = function (element, index, array) {
                    return this === element;
                };

                if ( attrs.checkForCheck && scope.searchParams[attrs.checkForCheck] ) {
                    var _searchArr = scope.searchParams[attrs.checkForCheck].split(",");

                    if ( _searchArr.lenght > 0 && _searchArr.some(_foundIt, attrs.filterCode) ) {
                        element.addClass( 'fa-check-square-o' );
                    } else {
                        element.addClass( 'fa-square-o' );
                    }
                } else {
                    element.addClass( 'fa-square-o' );
                }
            }
        };
    });

    /**
     * @note open/close sidebar filters (This could be more generic for use with other filters)
     */
    angular.module('obiWan').directive("toggleList", function () {
        return {
            restrict : "A",
            link : function(scope, element, attrs) {
                element.bind('click', function() {
                    scope.$apply(function () {
                        if ( scope.amenities.numToShowInAmenList === 6 ) {
                            scope.amenities.numToShowInAmenList = 11;
                            scope.amenities.amenitiesPredicate = 'name';
                            element.html("less");
                        } else {
                            scope.amenities.amenitiesPredicate = null;
                            scope.amenities.numToShowInAmenList = 6;
                            element.html("more");
                        }
                    });
                });
            }
        };
    });

    /**
     * @note add/remove sidebar filters on click (This could be more generic for use with other filters)
     */
    angular.module('obiWan').directive("toggleAmenitiesFilter", function ( ) {

        return {
            restrict : "A",
            link : function(scope, element, attrs) {

                element.bind('click', function() {

                    var code = attrs.toggleAmenitiesFilter;
                    var _box;
                    if ( element.hasClass("amenity") )  {
                        _box =  element.children();
                    } else {
                        _box = element;
                    }

                    if (  scope.searchParams.amenities && scope.searchParams.amenities.match(code) ) {
                        _box.addClass('fa-square-o');
                        _box.removeClass('fa-check-square-o');
                        scope.searchParams.amenities = scope.searchParams.amenities.replace(code + ",", "");
                        scope.searchParams.amenities = scope.searchParams.amenities.replace(code, "");
                    } else {
                        _box.removeClass('fa-square-o');
                        _box.addClass('fa-check-square-o');
                        scope.searchParams.amenities += (!scope.searchParams.amenities || scope.searchParams.amenities === "") ? "" : ",";
                        scope.searchParams.amenities += code;
                    }

                    if (scope.searchParams.amenities) {
                        scope.searchParams.amenities = scope.searchParams.amenities.replace("undefined", "");
                    }

                    scope.searchHotels();
                });
            }
        };
    });

    /**
     * @note used if the search doesn't return any results
     */
    angular.module('obiWan').directive("searchForSuggestion", function() {
        return function(scope, element, attrs) {
            element.bind('click', function() {
                var _suggestionElm = angular.element( document.querySelectorAll(".ob-form .suggestions") );
                _suggestionElm.addClass("ng-hide");
                scope.searchParams.location = attrs.searchForSuggestion;
                scope.searchHotels();
            });
        };
    });

    /**
     * @note adding star class to ratings
     */
    angular.module('obiWan').directive("starify", function() {

        var numString = function ( int ) {
            switch ( int ) {
                case "0":
                    return "zero";
                case "1":
                    return "one";
                case "2":
                    return "two";
                case "3":
                    return "three";
                case "4":
                    return "four";
                case "5":
                    return "five";
            }
        };

        return function(scope, element, attrs) {
            element.addClass( numString(attrs.starify) );
        };
    });

    /**
     * @note form validation (used in email confirmation)
     */
    angular.module('obiWan').directive('equals', function() {
        return {
            restrict: 'A', // only activate on element attribute
            require: '?ngModel', // get a hold of NgModelController
            link: function(scope, elem, attrs, ngModel) {
                if(!ngModel) { return; } // do nothing if no ng-model

                // watch own value and re-validate on change
                scope.$watch(attrs.ngModel, function() {
                    validate();
                });

                // observe the other value and re-validate on change
                attrs.$observe('equals', function (val) {
                    validate();
                });

                var validate = function() {
                    // values
                    var val1 = ngModel.$viewValue;
                    var val2 = attrs.equals;

                    // set validity
                    ngModel.$setValidity('equals', val1 === val2);
                };
            }
        };
    });

    /**
     * @note form validation (creditcard)
     */
    angular.module('obiWan').directive('validatecc', function (){
        return {
            require: 'ngModel',
            link: function(scope, elem, attr, ctrl) {
                var valid;
                var isValid = function (ccnumber) {
                    if (!ccnumber) { return ''; }
                    ccnumber = ccnumber.toString().replace(/\s+/g, '');
                    var len = ccnumber.length;
                    var mul = 0,
                        prodArr = [[0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [0, 2, 4, 6, 8, 1, 3, 5, 7, 9]],
                        sum = 0;

                    while (len--) {
                        sum += prodArr[mul][parseInt(ccnumber.charAt(len), 10)];
                        mul ^= 1;
                    }

                    return (sum % 10 === 0 && sum > 0);
                } ;

                ctrl.$parsers.unshift(function validate(ccnumber) {
                    valid = isValid(ccnumber);
                    ctrl.$setValidity('validatecc', valid);
                    return ccnumber;
                });

                ctrl.$formatters.unshift(function(value) {
                    ctrl.$setValidity('validatecc', isValid(value));
                    return value;
                });
            }
        };
    });

    /**
     * @note adds google map
     */
    angular.module('obiWan').directive("googleMap", [ "displayMap", function(displayMap) {
        return {
            restrict : "A",
            link : function(scope, element, attrs) {
                if ( scope.hotel && ( (scope.hotel.address1 && scope.hotel.address1) || (scope.hotel.latitude && scope.hotel.longitude) ) )  {
                    displayMap(element, scope.hotel);
                } else {
                    // detect outside changes and update map
                    scope.$on('i-haz-latlong', function () {
                        displayMap(element, scope.hotel);
                    });
                }
            }
        };
    }]);

    /**
     * @note opens modal gallery
     */
    angular.module('obiWan').directive('swipeBox', function() {
        return function(scope, element, attrs) {
            element.bind('click', function (e) {
                e.preventDefault();
                $( "#loading-overlay" ).toggleClass( "hide" );
                $.swipebox(scope.media);
            });
        };
    });

    // TODO: these are all using jquery, so they shoudl be updated (I just copied and pasted TMBR code here...)
    angular.module('obiWan').directive("sticky", function() {
        return function(scope, element, attrs) {
            $(element).sticky({ topSpacing: 0, className:"fixed" });
        };
    });

    angular.module('obiWan').directive("responsiveRightMenu", ['$anchorScroll', function($anchorScroll) {

        return function(scope, element, attrs) {
        // Controls for slide out nav
        var menuRight = element,
            showRight = angular.element( document.querySelectorAll( '#showRight' )),
            hideRight = angular.element( document.querySelectorAll( '#hideRight' )),
            overlay = angular.element( document.querySelectorAll( '#menu-overlay' ));

            showRight.bind('click',function() {
                angular.element( this ).toggleClass('active');
                angular.element( overlay ).toggleClass('show');
                angular.element( menuRight ).toggleClass('cbp-spmenu-open');
                $anchorScroll();
            });

            hideRight.bind('click',function() {
                angular.element( this ).toggleClass('active');
                angular.element( overlay ).toggleClass('show');
                angular.element( menuRight ).toggleClass('cbp-spmenu-open');
            });

            menuRight.bind('click', function() {
                angular.element( this ).removeClass('active');
                angular.element( overlay ).removeClass('show');
                angular.element( menuRight ).removeClass('cbp-spmenu-open');
            });

        };
    }]);

    angular.module('obiWan').directive("responsiveLeftMenu", ['$anchorScroll', function($anchorScroll) {
        return function(scope, element, attrs) {
            // Controls for slide out nav
            var menuLeft = angular.element( document.querySelectorAll( '#cbp-spmenu-s1' )),
                showLeft = angular.element( document.querySelectorAll( '#showLeft' )),
                hideLeft = angular.element( document.querySelectorAll( '#hideLeft' )),
                overlay = angular.element( document.querySelectorAll( '#menu-overlay' ));

            showLeft.bind('click', function() {
                angular.element( this ).toggleClass('active');
                angular.element( overlay ).toggleClass('show');
                angular.element( menuLeft ).toggleClass('cbp-spmenu-open');
                $anchorScroll();
            });

            hideLeft.bind('click',function() {
                angular.element( this ).removeClass('active');
                angular.element( overlay ).removeClass('show');
                angular.element( menuLeft ).removeClass('cbp-spmenu-open');
            });

            menuLeft.bind('click', function () {
                angular.element( this ).removeClass('active');
                angular.element( overlay ).removeClass('show');
                angular.element( menuLeft ).removeClass('cbp-spmenu-open');
            });
        };
    }]);

    angular.module('obiWan').directive("responsiveMenuOverlay", function() {
        return function(scope, element, attrs) {
            // Controls for slide out nav
            var menuLeft = angular.element( document.querySelectorAll( '#cbp-spmenu-s1' )),
                menuRight = angular.element( document.querySelectorAll( '#cbp-spmenu-s2' )),
                overlay = element;

            overlay.bind('click',function() {
                angular.element( menuLeft ).removeClass('active');
                angular.element( menuRight ).removeClass('active');
                angular.element( overlay ).removeClass('show');
                angular.element( menuLeft ).removeClass('cbp-spmenu-open');
                angular.element( menuRight ).removeClass('cbp-spmenu-open');
            });
        };
    });

    angular.module('obiWan').directive('liveChat', ['initLiveChat', function(initLiveChat){
        return {
            restrict: 'A',
            link: function($scope, $elem, attrs) {
                $scope.$watch(
                    function() { return $scope.pageId; },
                    function(newValue, oldValue) {
                        if ( newValue !== "external-search-page" && newValue !== "" ) {
                            initLiveChat();
                        }
                    }
                );
            }
        };
    }]);

    angular.module('obiWan').directive('googleAnalytics', ['initGoogleAnalytics', function(initGoogleAnalytics){
        return {
            restrict: 'A',
            link: function($scope, $elem, attrs) {
                $scope.$watch(
                    function() { return $scope.pageId; },
                    function(newValue, oldValue) {
                        if ( newValue !== "external-search-page" && newValue !== "" ) {
                            initGoogleAnalytics();
                        }
                    }
                );
            }
        };
    }]);

    angular.module('obiWan').directive('googleMaps', ['initGoogleMaps', function(initGoogleMaps){
        return {
            restrict: 'A',
            link: function($scope, $elem, attrs) {
                $scope.$watch(
                    function() { return $scope.pageId; },
                    function(newValue, oldValue) {
                        if ( newValue !== "external-search-page" && newValue !== "search-page" && newValue !== "" && !$scope.$root.hazMapInit ) {
                            initGoogleMaps();
                            $scope.$root.hazMapInit = true;
                        }
                    }
                );
            }
        };
    }]);
