<%@ page language="java" contentType="text/html; charset=UTF-8"
 pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%@ taglib prefix="spring" uri="http://www.springframework.org/tags"%>
<!DOCTYPE html>

<html>

<head>

		<spring:url value="/resources/js/angular.min.js" var="angularJs" htmlEscape="true"/>
		<script src="${angularJs}"></script>
		<meta name="viewport" content="width=device-width, initial-scale=1"/>

<title>Access Denied</title>

</head>

<body>

<h1> You do not have permission to access this page! </h1>

<form action="${pageContext.request.contextPath}/login?logout" method="post">

          <input type="submit" value="Sign in as different user" /> 

          <input type="hidden" name="${_csrf.parameterName}" value="${_csrf.token}" />

    <input type="hidden"
    name="${_csrf.parameterName}"
    value="${_csrf.token}"/> 
</form>   

</body>

</html>