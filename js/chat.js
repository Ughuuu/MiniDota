socket.on('chat message', function(player){
	console.log(player.msg);
});

socket.on('chat event',function(data){
	//empty player list and update it
});

app.controller('MainChat', ['$scope', function($scope) {
	$scope.player_list = [];
	$scope.message_list = [];

    $scope.doConnection = function(){
        if (angular.element('#button').text() == "Connect!") {
            var nameCurrent = angular.element('#send').text();
            socket.emit('makePlayer',{name:nameCurrent});
            angular.element('#send').val('');
            angular.element('#button').text("Send");
        } else {
            socket.emit('chat message', angular.element('#send').val());
            angular.element('#send').val('');
        }  
    };
}]);

app.controller('AppCtrl', function($scope) {
  $scope.title1 = 'Button';
  $scope.title4 = 'Warn';
  $scope.isDisabled = true;
  $scope.googleUrl = 'http://google.com';
});
