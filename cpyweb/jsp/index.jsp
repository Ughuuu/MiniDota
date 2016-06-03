<%@ taglib prefix="spring" uri="http://www.springframework.org/tags"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ taglib uri="http://www.springframework.org/tags/form" prefix="form"%>
<%@ taglib prefix="sec" uri="http://www.springframework.org/security/tags" %>
<%@page session="true"%>
<!DOCTYPE html>
<html lang="en">
	<head>
		<spring:url value="/resources/css/angular-material.min.css" var="angularMaterialCss" htmlEscape="true"/>
		<spring:url value="/resources/css/robotoFont.css" var="robotoFont" htmlEscape="true"/>

		<spring:url value="/resources/js/controllers/app.js" var="appJs" htmlEscape="true"/>

		<spring:url value="/resources/js/controllers/create.js" var="createJs" htmlEscape="true"/>
		<spring:url value="/resources/js/controllers/report.js" var="reportJs" htmlEscape="true"/>
		<spring:url value="/resources/js/controllers/update.js" var="updateJs" htmlEscape="true"/>
		<spring:url value="/resources/js/controllers/view.js" var="viewJs" htmlEscape="true"/>
		<spring:url value="/resources/js/controllers/edit.js" var="editJs" htmlEscape="true"/>
		<spring:url value="/resources/js/controllers/send.js" var="sendJs" htmlEscape="true"/>
		<spring:url value="/resources/js/controllers/home.js" var="homeJs" htmlEscape="true"/>
		<spring:url value="/resources/js/controllers/history.js" var="historyJs" htmlEscape="true"/>
		<spring:url value="/resources/js/controllers/account.js" var="accountJs" htmlEscape="true"/>
		<spring:url value="/resources/js/controllers/openAcc.js" var="openAccJs" htmlEscape="true"/>

		<spring:url value="/resources/jsp/views/create.html" var="createView" htmlEscape="true"/>
		<spring:url value="/resources/jsp/views/report.html" var="reportView" htmlEscape="true"/>
		<spring:url value="/resources/jsp/views/update.html" var="updateView" htmlEscape="true"/>
		<spring:url value="/resources/jsp/views/view.html" var="viewView" htmlEscape="true"/>
		<spring:url value="/resources/jsp/views/edit.html" var="editView" htmlEscape="true"/>
		<spring:url value="/resources/jsp/views/send.html" var="sendView" htmlEscape="true"/>
		<spring:url value="/resources/jsp/views/home.html" var="homeView" htmlEscape="true"/>
		<spring:url value="/resources/jsp/views/history.html" var="historyView" htmlEscape="true"/>
		<spring:url value="/resources/jsp/views/account.html" var="accountView" htmlEscape="true"/>
		<spring:url value="/resources/jsp/views/openAcc.html" var="openAccView" htmlEscape="true"/>

		<spring:url value="/resources/js/angular.min.js" var="angular" htmlEscape="true"/>
		<spring:url value="/resources/js/angular-animate.min.js" var="angularAnimate" htmlEscape="true"/>
		<spring:url value="/resources/js/angular-aria.min.js" var="angularAria" htmlEscape="true"/>
		<spring:url value="/resources/js/angular-material.min.js" var="angularMaterialJs" htmlEscape="true"/>
		<spring:url value="/resources/js/angular-messages.min.js" var="angularMesages" htmlEscape="true"/>
		<spring:url value="/resources/js/jquery-2.2.3.min.js" var="jQuery" htmlEscape="true"/>
		<spring:url value="/resources/js/angular-ui-router.min.js" var="angularUiRoute" htmlEscape="true"/>
		<link rel="icon" href="${icon}" type="image/x-icon">
		<link rel="shortcut icon" href="${icon}" type="image/x-icon">
		<link href="${robotoFont}" rel="stylesheet"/>
		<script src="${angular}"></script>
		<link href="${angularMaterialCss}" rel="stylesheet" />
		<script src="${jQuery}"></script>
		<script src="${angularAnimate}"></script>
		<script src="${angularAria}"></script>
		<script src="${angularMesages}"></script>
		<script src="${angularMaterialJs}"></script>
		<script src="${angularUiRoute}"></script>
		<!-- hidden variables -->
		<c:url value="/login" var="loginUrl" />
		<c:url value="/login?logout" var="logoutUrl" />
		<c:url value="/registerUser" var="registerUserUrl" />
		<c:url value="/registerClient" var="registerClientUrl" />
		<c:url value="/editUser" var="editUser" />
		<c:url value="/deleteAccount" var="removeAccountUrl"/>
		<c:url value="/getCurrentData" var="getCurrentUrl" />
		<c:url value="/getHistory" var="historyUrl" />
		<c:url value="/send" var="sendUrl" />
		<c:url value="/getDataClient" var="getClientUrl" />
		<c:url value="/getDataUser" var="getDataUser" />
		<c:url value="/welcome" var="welcomeUrl" />
		<c:url value="/getAccountClient" var="accountUrl" />
		<c:url value="/registerAccount" var="registerAccountUrl" />
		<c:url value="/removeUser" var="removeUserUrl" />
		<c:url value="/getReport" var="reportUrl" />
		<c:url value="/updateUser" var="updateUserUrl" />
		<c:url value="/updateClient" var="updateClientUrl" />
		<c:url value="/removeClient" var="removeClientUrl" />
		<sec:authorize access="hasRole('USER')">
		<script>
			var name = '${pageContext.request.userPrincipal.name}';
			var editView = '${editView}';
			var sendView = '${sendView}';
			var historyView = '${historyView}';	
			var createView = '${createView}';
			var reportView = '${reportView}';
			var updateView = '${updateView}';
			var viewView = '${viewView}';
			var accountView = '${accountView}';
			var openAccView = '${openAccView}';

			var registerUrl = '${registerClientUrl}';		
			var updateUser = '${updateClientUrl}';
			var registerAccountUrl = '${registerAccountUrl}';
			var removeAccountUrl = '${removeAccountUrl}';
			var reportUrl = '${historyUrl}';
			var editUrl = '${editUser}';
			var getCurrentUrl = '${getCurrentUrl}';
			var accountUrl = '${accountUrl}';
			var sendUrl = '${sendUrl}';
			var getUserUrl = '${getClientUrl}';
			var removeUserUrl = '${removeClientUrl}';
		</script>		
		</sec:authorize>

		<sec:authorize access="hasRole('ADMIN')">
		<script>
			reportUrl = '${reportUrl}';
			getUserUrl = '${getDataUser}';
			removeUserUrl = '${removeUserUrl}';
			registerUrl = '${registerUserUrl}';
			updateUser = '${updateUserUrl}';	

		</script>		
		</sec:authorize>
		<script>
			var logoutUrl = '${logoutUrl}';
			var loginUrl = '${loginUrl}';
			var homeView = '${homeView}';
			var role = "none";
			var userLog = ${pageContext.request.userPrincipal.name != null};
			var csrfParameter = '${_csrf.parameterName}';
			var csrfToken = '${_csrf.token}';
		</script>
		<script src="${appJs}"></script>
		<script src="${homeJs}"></script>
		<sec:authorize access="hasRole('USER')">
		<script src="${editJs}"></script>
		<script src="${sendJs}"></script>
		<script src="${historyJs}"></script>
		<script src="${openAccJs}"></script>
		<script src="${createJs}"></script>
		<script src="${reportJs}"></script>
		<script src="${updateJs}"></script>
		<script src="${viewJs}"></script>
		<script src="${accountJs}"></script>
		<script>
			role = "user";
		</script>
		</sec:authorize>	
		<sec:authorize access="hasRole('ADMIN')">
		<script src="${editJs}"></script>
		<script>
			role = "admin";
		</script>
		</sec:authorize>
		<style>
		.page{
			height:100%;
		}
		</style>
		<title>
		Bank App - Home Page
		</title>
	</head>
	<body ng-app="MainScreen" ng-cloak>
		<div ng-controller="AppCtrl" ng-cloak layout="column" class="page">
			<md-toolbar class="md-primary">
			<div class="md-toolbar-tools">
				<a href = "${welcomeUrl}"><h2 class="md-flex">Online Bank</h2></a>
				<span flex></span>
				<h2 class="md-flex" ng-bind="Username"></h2>
				<span flex></span>
				<div class="logged" ng-style="isLog" layout="row">
					<sec:authorize access="hasRole('USER')">
					<form action="${logoutUrl}" method="POST" id="LogOutForm">
						<input type="hidden" name="${_csrf.parameterName}"
						value="${_csrf.token}"/>
						<md-button class="md-raised md-warn" ng-click="LogOut()">Logout</md-button>
					</form>
					</sec:authorize>
				</div>
				<div id="logout" ng-style="isNotLog" layout="row">
					<md-button href="${loginUrl}" type="submit" class="md-raised md-warn">Login</md-button>
					<!--
					<md-button href="${registerUrl}" type="submit" class="md-raised md-accent">Register</md-button>
					-->
				</div>
			</div>
			</md-toolbar>
			<md-content flex layout-padding>
				<md-tabs md-dynamic-height md-border-bottom md-selected="0">
					<md-tab ng-repeat="tab in tabs" md-on-select="onTabSelected($index)" md-on-deselect="announceDeselected($index)" label="{{tab}}">					
				</md-tabs>
				<section ui-view></section>
			</md-content>
			<md-toolbar class="md-primary">
			<div class="md-toolbar-tools">
				<a href = "${welcomeUrl}"><h2 class="md-flex">Online Bank</h2></a>
				<span flex></span>
			</div>
			</md-toolbar>
		</div>
	</div>
</body>
</html>