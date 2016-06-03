function getYesterday(){
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1; //January is 0!
	var yyyy = today.getFullYear();
	mm-=1;

	if(dd<10) {
	    dd='0'+dd
	} 

	if(mm<10) {
	    mm='0'+mm
	} 

	today = yyyy+'-'+mm+'-'+dd;
	return today;
}

function getToday(){
	var today = new Date();
	var dd = today.getDate() + 1;
	var mm = today.getMonth()+1; //January is 0!
	var yyyy = today.getFullYear();
	if(mm==0){
		mm=1;
		yyyy-=1;
	}

	if(dd<10) {
	    dd='0'+dd
	} 

	if(mm<10) {
	    mm='0'+mm
	} 

	today = yyyy+'-'+mm+'-'+dd;
	return today;
}

app.controller('ReportCtrl', ['$scope', '$stateParams', function($scope, $stateParams) {
	$scope.report = [];
    $scope.errormsg = "Send money online. Today.";
    $scope.bounds = [5,10,15,25];
    $scope.maxSel = 5;
    $scope.start = 0;
    $scope.init = function() {
        $.get(reportUrl, { username: $stateParams.username, pageStart:$scope.start, pageCount:$scope.maxSel, date_start: getYesterday(), date_end:getToday()}, function(data) {
            if (data == '') {} else {
                $scope.report = JSON.parse(data);
                $scope.report.unshift({user:'User',operation_type:'Type',client:'Client',date:'Date Added'});
                $scope.$apply();
            }
        })
    }
    $scope.init();
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
}]);
