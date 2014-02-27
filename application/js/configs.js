/**
 * Created with RubyMine.
 * By: superrunt
 * Date: 2/27/14
 * Time: 11:07 AM
 */




angular.module('obiWan')
    .config(function($datepickerProvider) {
        angular.extend($datepickerProvider.defaults, {
            dateFormat: 'MM/dd/yyyy',
            startWeek: 1,
            autoclose: true
        });
    });