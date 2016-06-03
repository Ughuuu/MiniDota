app.controller('OpenAccCtrl', ['$scope', '$stateParams', function($scope, $stateParams) {
    $scope.csrfParameter = csrfParameter;
    $scope.csrfToken = csrfToken;
    $scope.errormsg = "Please fill the forms.";
    $scope.types = ['Debit', 'Credit'];
    $scope.project = {
        id: $stateParams.id,
        type: "Debit"
    };
    $scope.register = function() {
        $.post(registerAccountUrl, $('#projectForm').serialize(), function(data) {
            if (data == '') {
                $('#projectForm').hide('slow', function() {
                	$('#projectForm').show();
                    $scope.errormsg = "User added successful.";
                    $scope.$apply();
                });
            } else {
                $('#errormsg').hide('slow', function() {
                    $('#errormsg').show('slow');
                    $scope.errormsg = data;
                    $scope.$apply();
                });
            }
        });
    }
}]);