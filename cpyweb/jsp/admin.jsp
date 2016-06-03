<%@taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@page session="true"%>
<html>
<body>
    <h1>Title : ${title}</h1>
    <h1>Message : ${message}</h1>

    <c:url value="/login?logout" var="logoutUrl" />
    <form action="{{logoutUrl}}" method="post" id="logoutForm">
        <input type="hidden" name="${}"
            value="{{csrfToken}}" />
    </form>
    <script>
        function formSubmit() {
            document.getElementById("logoutForm").submit();
        }
    </script>

    <c:if test="${pageContext.request.userPrincipal.name != null}">
        <h2>
            Welcome : {{name}} | <a
                href="javascript:formSubmit()"> Logout</a>
        </h2>
    </c:if>

</body>
</html>