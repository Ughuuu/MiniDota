<%@ taglib prefix="spring" uri="http://www.springframework.org/tags"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ taglib uri="http://www.springframework.org/tags/form" prefix="form"%>
<!DOCTYPE html>
<html lang="en">
	<head>
		<spring:url value="/resources/core/css/bootstrap.min.css" var="bootstrapCss" htmlEscape="true"/>
		<spring:url value="/resources/core/js/angular.min.js" var="angularJs" htmlEscape="true"/>
		<script src="${angularJs}"/>
		<link href="${bootstrapCss}" rel="stylesheet" />
		<meta name="viewport" content="width=device-width, initial-scale=1"/>
	</head>
	<body>
		<nav class="navbar navbar-inverse navbar-fixed-top">
				<div class="container">
						<div class="navbar-header">
								<a class="navbar-brand" href="#">Bank2</a>
						</div>
				</div>
		</nav>
		<div class="jumbotron">
			<div class="container">
				<h1>${title}</h1>
				<p>
					<c:if test="${not empty msg}">
						Hello ${msg}
					</c:if>
				</p>
					<c:if test="${empty msg}">
					Welcome Welcome!
					</c:if>
				<p>
					<a class="btn btn-primary btn-lg" href="#" role="button">Learn more</a>
				</p>
			</div>
		</div>
		<div class="container">
			<div class="row">
				<div class="col-md-4">
						<h2>Heading</h2>
						<p>ABC</p>
						<p>
								<a class="btn btn-default" href="#" role="button">View details</a>
						</p>
				</div>
				<div class="col-md-4">
						<h2>Heading</h2>
						<p>ABC</p>
						<p>
								<a class="btn btn-default" href="#" role="button">View details</a>
						</p>
				</div>
				<div class="col-md-4">
						<h2>Heading</h2>
						<p>ZXY</p>
						<p>
								<a class="btn btn-default" href="#" role="button">View details</a>
						</p>
				</div>
			</div>
			<hr/>
			<footer>
				<p>DaianBank 2016</p>
			</footer>
		</div>
	</body>
</html>