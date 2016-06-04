var socket = io();

var app = angular.module('MainScreen', ['ngAnimate', 'ngAria', 'ngMaterial', 'ngMessages']);

app.config(function($mdThemingProvider) {
    $mdThemingProvider.theme('default')
        .primaryPalette('indigo')
        .accentPalette('deep-orange');
});
