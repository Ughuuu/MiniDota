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
var GLOBAL_ID = 0;
var PLAYERS = 0;
var timeStep = 1000 / 60.0;
var MAP = {};

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

	socket.on('chat message', function(msg){
		var player = new Object();
		player.name = PLAYER_LIST[socket.id].name;
		player.msg = msg;
	  	io.emit('chat message', player);
	});

	socket.on('disconnect',function(){
	    delete SOCKET_LIST[socket.id];
    	if(PLAYER_LIST[socket.id] == null)
    		return;
    	PLAYER_LIST[socket.id].destroy = true;
		PLAYERS--;
    });
});

function connectNewPlayers(){	
	for (var i = NEW_PLAYER_LIST.length - 1; i >= 0; i--) {
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
    sendData(computeData());
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

function updatePlayers(){
	connectNewPlayers();

	removeDisconnected();

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

var Node = function(x, y, height, id) {
    var self = {
        id: id,
        neighbours: [],
        x: x,
        y: y,
        height: height,
        addNeigh: function(name) {
            this.neighbours.push(name);
        }
    };
    return self;
};

var createMap = function() {
    var fs = require('fs');
    var lines = fs.readFileSync('map.graph').toString().split("\n");
    var n = lines[0];
    for (var i = 1; i <= n; ++i) {
        var details = lines[i].toString().split(' '); 
        MAP[details[0]] = Node(details[1], details[2], details[3], details[0]);
    }
    for (var i = +n + 1; i < lines.length; ++i) {
        var nodes = lines[i].toString().split(' ');
        for (var j = 0; j < nodes.length - 1; ++j) {
            MAP[nodes[j]].addNeigh(MAP[nodes[j + 1]].id);
            MAP[nodes[j + 1]].addNeigh(MAP[nodes[j]].id);
        }
    }
};

http.listen(3000, function(){
  console.log('listening on *:3000');
  createMap();
});