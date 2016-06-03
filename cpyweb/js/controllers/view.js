app.controller('ViewCtrl', ['$scope', function($scope) {
    $scope.errormsg = "Edit your user details.";
    $scope.users = [];
    $scope.start = 0;
    $scope.bounds = [5,10,15,25];
    $scope.maxSel = 5;
    $scope.selected = 0;
    $scope.curindex = -1;
    $scope.id = 123;
    $scope.role = role;
    $scope.init = function() {
        $.get(getUserUrl, { pageStart:$scope.start, pageCount:$scope.maxSel }, function(data) {
            if (data == '') {} else {
            	users = [];
                $scope.users = JSON.parse(data);
                $scope.users.unshift({name:'Name',surname:'Surname',email:'Email',address:'Address',city:'City',state:'state' });
                $scope.$apply();
                if(role!='admin')
                $('.admOnly').remove();
                else
                $('.usrOnly').remove();
            }
        })
    }
    $scope.reset = function(){
	    $scope.start = 0;
	    $scope.selected = 0;
    	$scope.init();
    }

    $scope.onCheckClick = function(index){
    	if($scope.users[index].check == true){
    		$scope.users[index].check = false;
    	}else{
    		$scope.users[index].check = true;
    	}
    	if(index == 0){
    		for (var i = 0; i < $scope.users.length; i++) {
    			$scope.users[i].check = $scope.users[0].check;
    		}
    		if($scope.users[0].check == true){
    			$scope.selected = $scope.maxSel;
    		}else{
    			$scope.selected = 0;    			
    		}
    	}else{
    		if($scope.users[index].check == true){
    		$scope.selected++;
    		}else{
    		$scope.selected--;
    		}
    	}
    		for (var i = 0; i < $scope.users.length; i++) {
    			if($scope.users[i].check){
    			$scope.curindex = i;
    			break;
    			}
    		}
    }
    $scope.onSecondClick = function(index){
    	if(index == 0){
    		for (var i = 0; i < $scope.users.length; i++) {
    			$scope.users[i].check = $scope.users[0].check;
    		}
    		if($scope.users[0].check == true){
    			$scope.selected = $scope.maxSel
    		}else{
    			$scope.selected = 0;    			
    		}
    	}else{    		
    		if($scope.users[index].check == true){
    		$scope.selected++;
    		}else{
    		$scope.selected--;
    		}
    	}
    		for (var i = 0; i < $scope.users.length; i++) {
    			if($scope.users[i].check){
    			$scope.curindex = i;
    			break;
    			}
    		}
    }
    $scope.doDelete = function(){
    	for (var i = 0; i < $scope.users.length; i++) {
    		if($scope.users[i].check == true && i!=0){
    			$scope.id = $scope.users[i].id;
    			$('#id').val($scope.users[i].id);
    		$.post(removeUserUrl, $('#removeForm').serialize(), function(data) {
    			alert(data);
	            if (data == '') {
	                $('#removeForm').hide('slow', function() {
	                    $('#removeForm').show('slow');
	                    $scope.reset();
	                    $scope.$apply();
	                });
	            } else {
	                $('#errmsg').hide('slow', function() {
	                    $('#errmsg').show('slow');
	                    $scope.errormsg = data;
	                    $scope.$apply();
	                });
	            }
	        });
    	}
    	}
    }
    $scope.goNext = function(){
    	if($scope.users.length==parseInt($scope.maxSel)+1){
    		$scope.start+=$scope.maxSel;
    		$scope.init();
    	}
    }
    $scope.goBack = function(){
    	if($scope.start!=0){
    		$scope.start-=$scope.maxSel;    		
    		$scope.init();
    	}
    }
    $scope.goEdit = function(){
    	//$state.
    }
    $scope.init();
}]);
