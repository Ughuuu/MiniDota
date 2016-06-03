app.controller('EditCtrl', ['$scope', function($scope) {
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
        $.get(getCurrentUrl, {}, function(data) {
            if (data == '') {} else {
                $scope.project = JSON.parse(data)[0];
                $scope.$apply();
            }
        })
    }
    $scope.init();
    $scope.edit = function() {
        $.post(editUrl, $('#projectForm').serialize(), function(data) {
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
