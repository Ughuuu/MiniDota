app.controller('UpdateCtrl', ['$scope', '$stateParams', function($scope, $stateParams) {
	$scope.id = $stateParams.id;
    $scope.errormsg = "Edit your user details.";
    $scope.states = ['Alba', 'Arad', 'Arges', 'Bacau', 'Bihor', 'Bistrita', 'Botosani', 'Brasov', 'Braila', 'Bucuresti', 'Buzau', 'Caras', 'Calarasi', 'Cluj', 'Constanta', 'Covasna', 'Dambovita', 'Dolj', 'Galati', 'Giurgiu', 'Gorj', 'Harghita', 'Hunedoara', 'Ialomita', 'Iasi', 'Ilfov', 'Maramures', 'Mehedinti', 'Mures', 'Neamt', 'Olt', 'Prahova', 'Satu', 'Salaj', 'Sibiu', 'Suceava', 'Teleorman', 'Timis', 'Tulcea', 'Vaslui', 'Valcea', 'Vrancea'];
    $scope.project = {
        password: "",
        name: "",
        surname: "",
        email: "",
        address: "",
        city: "",
        state: "Alba"
    };
    $scope.init = function() {
        $.get(getUserUrl, { id: $stateParams.id, pageStart:0, pageCount:1 }, function(data) {
            if (data == '') {} else {
                $scope.project = JSON.parse(data)[0];
                if(role!='admin')
                $('.admOnly').remove();
            else
                $('.usrOnly').remove();
                $scope.$apply();
            }
        })
    }
    $scope.init();
    $scope.edit = function() {
        $.post(updateUser, $('#projectForm').serialize(), function(data) {
            if (data == '') {
                $('.outerForm').hide('slow', function() {
                    $('.outerForm').show('slow');
                    $scope.errormsg = "Edit your user details.";
                    $scope.$apply();
                });
            } else {
                $('.errmsg').hide('slow', function() {
                    $scope.errormsg = data;
                    $scope.$apply();
                });
            }
        });
    }
}]);
