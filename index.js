var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var favicon = require('serve-favicon');

app.use(express.static(__dirname + '/'));

app.use(favicon(__dirname + '/res/jugg.png'));

app.get('/', function(req, res){
	res.sendFile(__dirname + '/html/index.html');
});

var SOCKET_LIST = {};
var PLAYER_LIST = {};
var NEW_PLAYER_LIST = [];
var PLAYER_FIND_LIST = [];
var GAME_LIST = new Map();
var GLOBAL_ID = 0;
var PLAYERS = 0;
var timeStep = 1000 / 60.0;

io.on('connection', function(socket){

	socket.id = GLOBAL_ID + 1;
		GLOBAL_ID++;
	SOCKET_LIST[socket.id] = socket;

	socket.on('makePlayer',function(name){
    	if(PLAYER_LIST[socket.id] != null)
    		return;
		PLAYERS++;
	 	NEW_PLAYER_LIST.push({id:socket.id, name:name.name});
    });

    socket.on('play request', function(input){
        if(PLAYER_LIST[socket.id] == null){
            SOCKET_LIST[socket.id].emit("play registered", false);
        }else {
            console.log(socket.id);
            SOCKET_LIST[socket.id].emit("play registered", true);
            PLAYER_FIND_LIST.push(socket.id);
        }      
    });

	socket.on('chat message', function(msg){
		var player = new Object();
		player.name = PLAYER_LIST[socket.id].name;
		player.msg = msg;
	  	io.emit('chat message', player);
	});

	socket.on('disconnect',function(){
        console.log("dc");
	    delete SOCKET_LIST[socket.id];
    	if(PLAYER_LIST[socket.id] == null)
    		return;
    	PLAYER_LIST[socket.id].destroy = true;
		PLAYERS--;
        if(GAME_LIST.get(socket.id) != undefined){
            gameOver(socket.id, GAME_LIST.get(socket.id), GAME_LIST.get(socket.id));
        }
    });
});

function connectNewPlayers(){
	for (var i in NEW_PLAYER_LIST) {
		var id = NEW_PLAYER_LIST[i].id;
		var name = NEW_PLAYER_LIST[i].name;
		if(PLAYER_LIST[id] != null){
			continue;
		}
	    var player = Player(id, name);
	    PLAYER_LIST[id] = player;
	}
	if (NEW_PLAYER_LIST.length) {
		sendData(computeData());
		NEW_PLAYER_LIST = [];
	}
}

function removeDisconnected(){	
    for(var i in PLAYER_LIST){
        var player = PLAYER_LIST[i];
        if(player.destroy == true){    
        	PLAYERS--;    	
			
        	//destroy player here

	        delete PLAYER_LIST[player.id];
        }
    }
    sendData(computeData())
}

function computeData(){	
    var gameData = [];
    for(var i in PLAYER_LIST){
        var player = PLAYER_LIST[i];

        gameData.push({

        	//send relevant data here

            id: player.id,
            name: player.name
        });    
    }
    return gameData;
}

function sendData(data){	
    for(var i in SOCKET_LIST){
        var socket = SOCKET_LIST[i];
        socket.emit('chat event', data);
    }
}

function findGames(){
    var last = null;
    for (var i in PLAYER_FIND_LIST) {
        var id = PLAYER_FIND_LIST[i];
        // here get player, maybe later we might compute mmr or something
        var player = PLAYER_LIST[id];
        if(last == null){
            last = player;
        }else{
            console.log(player.id + " " + last.id);
            makeGame(player.id, last.id);
            last = null;
        }
    }
    if (PLAYER_FIND_LIST.length != 1) {
        // save the last for further games
        if(PLAYER_FIND_LIST.length %2 == 1){
            var player = PLAYER_FIND_LIST[PLAYER_FIND_LIST.length-1];
            PLAYER_FIND_LIST = [];
            PLAYER_FIND_LIST.push(player);
        }else{
            PLAYER_FIND_LIST = [];
        }
    }
}

function makeGame(id1, id2, winner){
    GAME_LIST.set(id1, id2);
    GAME_LIST.set(id2, id1);
    SOCKET_LIST[id1].emit("play start", id2);
    SOCKET_LIST[id2].emit("play start", id1);
}


function gameOver(id1, id2, winner){    
    GAME_LIST.delete(id1);
    GAME_LIST.delete(id2);
    if(SOCKET_LIST[id1] != undefined)
    SOCKET_LIST[id1].emit("game over", winner);
    if(SOCKET_LIST[id2] != undefined)
    SOCKET_LIST[id2].emit("game over", winner);
}

function updatePlayers(){
	connectNewPlayers();

	removeDisconnected();

    findGames();
    
	//var gameData = computeData();

	//sendData(gameData);
}

setInterval(updatePlayers, timeStep);

var Player = function(id, name, room){
    var self = {
    	room: room,
    	name:name,
        id:id,
    }
    return self;
}

http.listen(3000, function(){
  console.log('listening on *:3000');
});