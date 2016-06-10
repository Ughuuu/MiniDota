app.controller('ChatCtrl', function($scope) {
	$scope.player_list = [];
	$scope.message_list = [];
  $scope.nameCurrent = '';
  $scope.currentNavItem = 'page1';

  $scope.doConnection = function() {
      if (angular.element(document.querySelector('#button')).text() == "Send") {
        var msg = angular.element(document.querySelector('#send')).val();
        if (msg != '') {
          socket.emit('chat message', msg);
          angular.element(document.querySelector('#send')).val('');
        }
      }
      else if (angular.element(document.querySelector('#button')).text() == "Connect") {
        socket.emit('make player',{name: $scope.nameCurrent});
        angular.element(document.querySelector('#button')).text('Send');
        angular.element(document.querySelector('#send')).val('');
        angular.element(document.querySelector('#name-label')).text('');
      } else return;  
      
  };

  socket.on('chat message', function(player){
    var msg = new Object();
    msg.who = player.name;
    msg.what = player.msg;
    $scope.message_list.push(msg);
    $scope.$apply();
  });

  socket.on('chat event',function(data){
    $scope.player_list = [];
    for (var i in data) {
      var player = new Object();
      player.name = data[i].name;
      player.id = data[i].id;
      $scope.player_list.push(player);
    }
    $scope.$apply();
  });

});
