
var socket = io();

$("form").submit(function(e) {
    e.preventDefault();
    doConn();
});

socket.on('chat message', function(player){
	$('#messages').append($('<li>').text(player.name + ": " + player.msg));
});

socket.on('chat event',function(data){
	$('#player_list').empty();
	for (var i in data) {
		var name = data[i].name;
		$('#player_list').append($('<li>').text(name));
	}
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