<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="spring" uri="http://www.springframework.org/tags"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ taglib uri="http://www.springframework.org/tags/form" prefix="form"%>
<!DOCTYPE html>
<html>
    <head>
        <spring:url value="/resources/css/angular-material.min.css" var="angularMaterialCss" htmlEscape="true"/>
        <spring:url value="/resources/css/robotoFont.css" var="robotoFont" htmlEscape="true"/>
        <spring:url value="/resources/js/angular.min.js" var="angular" htmlEscape="true"/>
        <spring:url value="/resources/js/angular-animate.min.js" var="angularAnimate" htmlEscape="true"/>
        <spring:url value="/resources/js/angular-aria.min.js" var="angularAria" htmlEscape="true"/>
        <spring:url value="/resources/js/angular-material.min.js" var="angularMaterialJs" htmlEscape="true"/>
        <spring:url value="/resources/js/jquery-2.2.3.min.js" var="jQuery" htmlEscape="true"/>      
        <spring:url value="/resources/images/icon.png" var="icon" htmlEscape="true"/>
        <spring:url value="/resources/js/angular-messages.min.js" var="angularMesages" htmlEscape="true"/>
        <link rel="shortcut icon" type="image/x-icon" href="${icon}">
        <link rel="stylesheet" href="${robotoFont}">
        <link rel="stylesheet" href="${angularMaterialCss}">
        <script src="${jQuery}"></script>
      <script src="${angular}"></script>
      <script src="${angularAnimate}"></script>
      <script src="${angularAria}"></script>
      <script src="${angularMaterialJs}"></script>
      <script src="${angularMesages}"></script>
      <script>
        var app = angular.module('MainScreen', ['ngAnimate', 'ngAria', 'ngMaterial', 'ngMessages']);
        app.config(function($mdThemingProvider) {
        $mdThemingProvider.theme('default')
        .primaryPalette('brown')
        .accentPalette('amber');
        });
        </script>
        <style>
        .page{
        height:100%;
        }
        </style>
        <title>
        Bank App - Login Page
        </title>
    </head>
    <body ng-controller="AppCtrl" ng-app="MainScreen" ng-cloak>
        <div  layout="column" class="page">
            <md-toolbar class="md-primary">
            <div class="md-toolbar-tools">
                <a href = "/DaianBank/welcome"><h2 class="md-flex">Online Bank</h2></a>
                <span flex></span>
                <c:if test="${pageContext.request.userPrincipal.name == null and empty error and empty register}">
                <h2 class="md-flex">Please login with your credentials below.</h2>
                </c:if>
                <c:if test="${pageContext.request.userPrincipal.name != null}">
                <h2 class="md-flex">You are already logged in. Redirecting to home page</h2>
                <script>
                window.location.replace("/DaianBank/welcome");
                </script>
                </c:if>
                <c:if test="${not empty error and empty register}">
                <h2 class="md-flex">Try logging again.</h2>
                </c:if>
                <c:if test="${not empty register}">
                    <h2 class="md-flex" id="errmsg">{{errormsg}}</h2>
                </c:if>
            </div>
            </md-toolbar>
            <div layout="column" flex ng-cloak>
                <md-content layout-padding>
                <!-- LOGIN FORM -->
                <c:if test="${pageContext.request.userPrincipal.name == null and empty register}">
                <script>
                app.controller('AppCtrl', ['$scope', function($scope) {
                }]);
                </script>
                <c:url var="loginUrl" value="/login"/>
                <form name="projectForm" autocomplete="on" layout="column" action="${loginUrl}" method="POST">
                    <input type="hidden"
                    name="${_csrf.parameterName}"
                    value="${_csrf.token}"/>
                    <!-- CLIENT NAME -->
                    <md-input-container class="md-block">
                    <label>Client Username</label>
                    <input required name="username" ng-model="project.username" id="username">
                    <div ng-messages="projectForm.username.$error">
                        <div ng-message="required">This is required.</div>
                        <div ng-message="pattern">This field has invalid characters.</div>
                    </div>
                    </md-input-container>
                    <!-- CLIENT PASS -->
                    <md-input-container class="md-block">
                    <label>Client Password</label>
                    <input id="password" required type="password" name="password" ng-model="project.password"
                    minlength="8" maxlength="25" ng-pattern="/^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$/"/>
                    <div ng-messages="projectForm.password.$error" role="alert">
                        <div ng-message-exp="['required', 'minlength', 'maxlength', 'pattern']">
                            Your password must have minimum 8 characters, at least 1 Uppercase Alphabet, 1 Lowercase Alphabet and 1 Number.
                        </div>
                    </div>
                    </md-input-container>
                    <md-button class="md-raised md-accent" flex type="submit">
                    Login
                    </md-button>
                </form>
                </md-content>
                </c:if>
                <!-- REGISTER FORM -->
                <c:if test="${pageContext.request.userPrincipal.name == null and not empty register}">
                <c:url var="registerUrl" value="/register"/>
                <script>                
                    app.controller('AppCtrl', ['$scope', function($scope) {
                        $scope.errormsg = "Please fill the forms below.";
                        $scope.states = ['Alba','Arad','Arges','Bacau','Bihor','Bistrita','Botosani','Brasov','Braila','Bucuresti','Buzau','Caras','Calarasi','Cluj','Constanta','Covasna','Dambovita','Dolj','Galati','Giurgiu','Gorj','Harghita','Hunedoara','Ialomita','Iasi','Ilfov','Maramures','Mehedinti','Mures','Neamt','Olt','Prahova','Satu','Salaj','Sibiu','Suceava','Teleorman','Timis','Tulcea','Vaslui','Valcea','Vrancea'];
                        $scope.project = 
                        {
                            user:"",
                            password:"",
                            email:"",
                            address:"",
                            city:"",
                            state:"Alba",
                            name:"",
                            surname:""
                        };
                        $scope.register = function(){
                            $.post('${registerUrl}', $('#projectForm').serialize(), function(data) {
                                if(data==''){
                                    $('#projectForm').hide('slow', function(){
                                        window.location.replace("/DaianBank/login");
                                    });
                                }else{
                                    $('#errmsg').hide('slow', function(){
                                        $('#errmsg').show('slow');
                                        $scope.errormsg = data;
                                        $scope.$apply();
                                    });                                    
                                }
                            });
                        }
                    }]);
                </script>
                <form name="projectForm" layout="column" method="POST" id="projectForm" ng-submit="register()">
                    <input type="hidden"
                    name="${_csrf.parameterName}"
                    value="${_csrf.token}"/>

                    <md-input-container class="md-block">
                        <label>Client Username</label>
                        <input required name="user" ng-model="project.user" id="user">
                        <div ng-messages="projectForm.user.$error || projectForm.user.$error.name" role="alert">
                            <div ng-message="required">This field is required.</div>
                            <div ng-message="name">This name is taken.</div>
                        </div>
                        </md-input-container>
                    <md-input-container class="md-block">
                        <label>Client Password</label>
                        <input id="password" required type="password" name="password" ng-model="project.password"
                        minlength="8" maxlength="25" ng-pattern="/^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$/"/>
                        <div ng-messages="projectForm.password.$error" role="alert">
                            <div ng-message-exp="['required', 'minlength', 'maxlength', 'pattern']">
                                Your password must have minimum 8 characters, at least 1 Uppercase Alphabet, 1 Lowercase Alphabet and 1 Number.
                            </div>
                        </div>
                    </md-input-container>
                    <md-input-container class="md-block">
                        <label>Client Email</label>
                        <input required type="email" name="email" ng-model="project.email"
                               minlength="4" maxlength="50" ng-pattern="/^.+@.+\..+$/" />
                        <div ng-messages="projectForm.email.$error" role="alert">
                          <div ng-message-exp="['required', 'minlength', 'maxlength', 'pattern']">
                            Your email must be like a regular email.
                          </div>
                        </div>
                    </md-input-container>
                    <div layout="row">
                    <md-input-container class="md-block" flex>
                        <label>Client Name</label>
                        <input required name="name" ng-model="project.name" id="name" ng-pattern="/^[ a-zA-Z]+$/">
                        <div ng-messages="projectForm.name.$error" role="alert">
                            <div ng-message="required">This field is required.</div>
                            <div ng-message="pattern">This field contains invalid characters.</div>
                        </div>
                        </md-input-container>
                    <md-input-container class="md-block" flex>
                        <label>Client Surname</label>
                        <input required name="surname" ng-model="project.surname" id="surname" ng-pattern="/^[ a-zA-Z]+$/">
                        <div ng-messages="projectForm.surname.$error" role="alert">
                            <div ng-message="required">This field is required.</div>
                            <div ng-message="pattern">This field contains invalid characters.</div>
                        </div>
                        </md-input-container>
                        </div>

                    <div layout="row" flex>
                    <md-input-container class="md-block" flex>
                        <label>Client Address</label>
                        <input required name="address" ng-model="project.address" id="address">
                        <div ng-messages="projectForm.address.$error">
                            <div ng-message="required">This is required.</div>
                        </div>
                    </md-input-container>
                    <md-input-container class="md-block" flex>
                        <label>Client Numeric Personal Code</label>
                        <input required name="cnp" ng-model="project.cnp" id="cnp" ng-pattern="/^[0-9]{13}$/" md-maxlength="13"/>
                        <div ng-messages="projectForm.cnp.$error" role="alert" multiple>
                         <div ng-message="pattern" class="my-message">Use exactly 13 digits.
                        </div>
                          <div ng-message="maxlength" class="my-message">
                            Use exactly 13 digits.
                          </div>
                          <div ng-message="required" class="my-message">
                            You must enter a code.
                          </div>
                        </div>
                    </md-input-container>
                    </div>

                    <div layout="row" flex>
                    <md-input-container class="md-block" flex>
                        <label>Client City</label>
                        <input required name="city" ng-model="project.city" id="city" ng-pattern="/^[ a-zA-Z]+$/">
                        <div ng-messages="projectForm.city.$error" role="alert">
                            <div ng-message="required">This field is required.</div>
                            <div ng-message="pattern">This field contains invalid characters.</div>
                        </div>
                        </md-input-container>

                        <md-input-container class="md-block" flex>
                            <label>Client State</label>
                            <md-select ng-model="project.state" required>
                                <md-option ng-repeat="state in states" ng-value="state" required>
                                {{state}}
                                </md-option>
                            </md-select>
                            <input value="{{project.state}}" name="state" type="hidden">
                            <div ng-show="project.state==''"  role="alert">
                              <div >State is required.</div>
                            </div>
                        </md-input-container>
                    </div>
                    <md-button type="submit" class="md-raised md-accent" flex>
                        Register
                    </md-button>
                </form>
                </md-content>
                </c:if>
            </div>
            <md-toolbar class="md-primary">
            <div class="md-toolbar-tools">
                <a href = "/DaianBank/welcome"><h2 class="md-flex">Online Bank</h2></a>
                <span flex></span>
            </div>
            </md-toolbar>
        </div>
    </body>
</html>