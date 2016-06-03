
var socket = io();

socket.on('chat message', function(player){
	console.log(player.msg);
	$('#messages').append($('<li>').text(player.name + ": " + player.msg));
});

function doConn(){
    if ($('#button').text() == 'Connect!') {
        var nameCurrent = $('#send').val();
        socket.emit('makePlayer',{name:nameCurrent});
        $('#send').val('');
        $('#hellomsg').text(nameCurrent);
        $('#button').text('Send');
    } else {
    	socket.emit('chat message', $('#send').val());
		$('#send').val('');
    }
    
}