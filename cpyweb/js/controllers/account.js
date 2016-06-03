app.controller('AccountCtrl', ['$scope', '$stateParams', function($scope, $stateParams) {
    $scope.errormsg = "Edit your user details.";
    $scope.accounts = [];
    $scope.id = $stateParams.id;
    $scope.card_number;
    $scope.start = 0;
    $scope.bounds = [5,10,15,25];
    $scope.maxSel = 5;
    $scope.selected = 0;
    $scope.curindex = -1;
    $scope.role = role;
    $scope.init = function() {
        $.get(accountUrl, { id:$stateParams.id, pageStart:$scope.start, pageCount:$scope.maxSel }, function(data) {
            if (data == '') {} else {
            	accounts = [];
                $scope.accounts = JSON.parse(data);
                $scope.accounts.unshift({acc_type:'Type',ammount:'Ammount',card_number:'Card Number'});
                $scope.$apply();
            }
        })
    }
    $scope.reset = function(){
	    $scope.start = 0;
	    $scope.selected = 0;
    	$scope.init();
    }

    $scope.onCheckClick = function(index){
    	if($scope.accounts[index].check == true){
    		$scope.accounts[index].check = false;
    	}else{
    		$scope.accounts[index].check = true;
    	}
    	if(index == 0){
    		for (var i = 0; i < $scope.accounts.length; i++) {
    			$scope.accounts[i].check = $scope.accounts[0].check;
    		}
    		if($scope.accounts[0].check == true){
    			$scope.selected = $scope.maxSel;
    		}else{
    			$scope.selected = 0;    			
    		}
    	}else{
    		if($scope.accounts[index].check == true){
    		$scope.selected++;
    		}else{
    		$scope.selected--;
    		}
    	}
    		for (var i = 0; i < $scope.accounts.length; i++) {
    			if($scope.accounts[i].check){
    			$scope.curindex = i;
    			break;
    			}
    		}
    }
    $scope.onSecondClick = function(index){
    	if(index == 0){
    		for (var i = 0; i < $scope.accounts.length; i++) {
    			$scope.accounts[i].check = $scope.accounts[0].check;
    		}
    		if($scope.accounts[0].check == true){
    			$scope.selected = $scope.maxSel
    		}else{
    			$scope.selected = 0;    			
    		}
    	}else{    		
    		if($scope.accounts[index].check == true){
    		$scope.selected++;
    		}else{
    		$scope.selected--;
    		}
    	}
    		for (var i = 0; i < $scope.accounts.length; i++) {
    			if($scope.accounts[i].check){
    			$scope.curindex = i;
    			break;
    			}
    		}
    }
    $scope.doDelete = function(){
    	for (var i = 0; i < $scope.accounts.length; i++) {
    		if($scope.accounts[i].check == true && i!=0){
    			$scope.card_number = $scope.accounts[i].card_number;
    			$('#card_number').val($scope.accounts[i].card_number);
    		$.post(removeAccountUrl, $('#removeForm').serialize(), function(data) {
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
    	if($scope.accounts.length==parseInt($scope.maxSel)+1){
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
