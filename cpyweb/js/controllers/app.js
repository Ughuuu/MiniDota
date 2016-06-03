var app = angular.module('MainScreen', ['ngAnimate', 'ngAria', 'ngMaterial', 'ngMessages', 'ui.router']);

app.config(function($mdThemingProvider) {
    $mdThemingProvider.theme('default')
        .primaryPalette('brown')
        .accentPalette('amber');
});

app.controller('AppCtrl', ['$scope', '$state', function($scope, $state) {
    $scope.name = name;
    $scope.role = role;
    $scope.csrfParameter = csrfParameter;
    $scope.csrfToken = csrfToken;
    $scope.logoutUrl = logoutUrl;
    $scope.loginUrl = loginUrl;
    $scope.tabs = ['Home'];
    $scope.Username = "Welcome " + name;
    $scope.LogOut = function() {
        $.post($('#LogOutForm').attr('action'), $('#LogOutForm').serialize(), function(data) {
            $('.logged').hide('slow', function() {
                $('.logged').remove();
                $('#logout').show('slow');
                $scope.Username = "Welcome";
                $scope.tabs.splice(1, 5);
                $scope.$apply();

            });
        });
    }
    $scope.onTabSelected = function(index) {
        switch (index) {
            case 0:
                $state.go('welcome');
                break;
            case 1:
                $state.go('edit');
                break;
            case 2:
                $state.go('view');
                break;
            case 3:
                $state.go('create');
                break;
            case 4:
                $state.go('send');
                break;
        }
    }
    if (userLog) {
        if (role == 'admin')
            $scope.tabs = ['Home', 'Edit Data', 'View User', 'Create User'];
        if (role == 'user')
            $scope.tabs = ['Home', 'Edit Data', 'View Clients', 'Create Client', 'Send Money'];
        $scope.isLog = {};
        $scope.isNotLog = { 'display': 'none' };
    } else {
        $scope.isLog = { 'display': 'none' };
        $scope.isNotLog = {};
    }
}]);

app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
    if(role == "admin"){
    $stateProvider
        .state('welcome', {
            url: '/welcome',
            templateUrl: homeView,
            controller: 'HomeCtrl'
        })
        .state('edit', {
            url: '/edit',
            templateUrl: editView,
            controller: 'EditCtrl'
        })
        .state('report', {
            url: '/report',
            templateUrl: reportView,
            controller: 'ReportCtrl',
            params: {
                username: {
                    value: '0',
                    squash: true
                }
            }
        })
        .state('create', {
            url: '/create',
            templateUrl: createView,
            controller: 'CreateCtrl'
        })
        .state('update', {
            url: '/update',
            templateUrl: updateView,
            controller: 'UpdateCtrl',
            params: {
                username: {
                    value: '0',
                    squash: true
                }
            }
        })
        .state('view', {
            url: '/view',
            templateUrl: viewView,
            controller: 'ViewCtrl'
        });
    }else if(role == 'user'){

    $stateProvider
        .state('welcome', {
            url: '/welcome',
            templateUrl: homeView,
            controller: 'HomeCtrl'
        })
        .state('edit', {
            url: '/edit',
            templateUrl: editView,
            controller: 'EditCtrl'
        })
        .state('send', {
            url: '/send',
            templateUrl: sendView,
            controller: 'SendCtrl'
        })
        .state('history', {
            url: '/history',
            templateUrl: historyView,
            controller: 'HistoryCtrl'
        })
        .state('create', {
            url: '/create',
            templateUrl: createView,
            controller: 'CreateCtrl'
        })
        .state('update', {
            url: '/update',
            templateUrl: updateView,
            controller: 'UpdateCtrl',
            params: {
                id: {
                    value: 0,
                    squash: true
                }
            }
        })
        .state('open_acc', {
            url: '/open_acc',
            templateUrl: openAccView,
            controller: 'OpenAccCtrl',
            params: {
                id: {
                    value: 0,
                    squash: true
                }
            }
        })
        .state('account', {
            url: '/account',
            templateUrl: accountView,
            controller: 'AccountCtrl',
            params: {
                id: {
                    value: 0,
                    squash: true
                }
            }
        })
        .state('view', {
            url: '/view',
            templateUrl: viewView,
            controller: 'ViewCtrl'
        });
    }else{        
    $stateProvider
        .state('welcome', {
            url: '/welcome',
            templateUrl: homeView,
            controller: 'HomeCtrl'
        })
    }
    $urlRouterProvider.otherwise('welcome');
}]);
