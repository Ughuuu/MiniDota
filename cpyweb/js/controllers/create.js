app.controller('CreateCtrl', ['$scope', function($scope) {
	$scope.role = role;
    $scope.errormsg = "Please fill the forms below.";
    $scope.states = ['Alba', 'Arad', 'Arges', 'Bacau', 'Bihor', 'Bistrita', 'Botosani', 'Brasov', 'Braila', 'Bucuresti', 'Buzau', 'Caras', 'Calarasi', 'Cluj', 'Constanta', 'Covasna', 'Dambovita', 'Dolj', 'Galati', 'Giurgiu', 'Gorj', 'Harghita', 'Hunedoara', 'Ialomita', 'Iasi', 'Ilfov', 'Maramures', 'Mehedinti', 'Mures', 'Neamt', 'Olt', 'Prahova', 'Satu', 'Salaj', 'Sibiu', 'Suceava', 'Teleorman', 'Timis', 'Tulcea', 'Vaslui', 'Valcea', 'Vrancea'];
    $scope.project = {
        user: "",
        password: "",
        email: "",
        address: "",
        city: "",
        state: "Alba",
        name: "",
        surname: ""
    };
    setTimeout(function(){
    	if(role=="user")
    	$('#adminOnly').remove();
	}, 0);
    $scope.register = function() {
        $.post(registerUrl, $('#projectForm').serialize(), function(data) {
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