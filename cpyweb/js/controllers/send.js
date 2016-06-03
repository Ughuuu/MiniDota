app.controller('SendCtrl', ['$scope', function($scope) {
    $scope.errormsg = "Send money online. Today.";
    $scope.project = {
        from: '',
        sum: '',
        to: ''
    };
    $scope.send = function() {
        $.post(sendUrl, $('#sendForm').serialize(), function(data) {
            alert(data);
            if (data == '') {
                $('#sendForm').hide('slow', function() {
                    $('#sendForm').show('slow');
                    $scope.errormsg = "Transaction complete.";
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
}]);
