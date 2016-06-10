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
var PLAYER_MATCH = {};
var GAME_LIST = {};
var GLOBAL_PLAYER_ID = 0;
var PLAYERS = 0;
var timeStep = 1000 / 60.0;
var MAP = {};

io.on('connection', function(socket){
	socket.id = GLOBAL_PLAYER_ID + 1;
    GLOBAL_PLAYER_ID++;
	SOCKET_LIST[socket.id] = socket;

	socket.on('make player',function(name){
    	if(PLAYER_LIST[socket.id] != null)
    		return;
		PLAYERS++;
	 	NEW_PLAYER_LIST.push({id:socket.id, name:name.name});
    });

    socket.on('play request', function(input){
        if(PLAYER_LIST[socket.id] == null){
            SOCKET_LIST[socket.id].emit("play registered", false);
        }else {
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

    socket.on('play input', function(input){
        var id2 = PLAYER_MATCH[socket.id];
        if(id2 != undefined){
            var game = GAME_LIST[socket.id + "" + id2];
            if(game.player1_id == socket.id){
                game.input1 = input;
            }else{                
                game.input2 = input;
            }
        }
    });

	socket.on('disconnect',function(){
        console.log("dc");
	    delete SOCKET_LIST[socket.id];
    	if(PLAYER_LIST[socket.id] == null)
    		return;
    	PLAYER_LIST[socket.id].destroy = true;
		PLAYERS--;
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
		sendChat(computeChat());
		NEW_PLAYER_LIST = [];
	}
}

function removeDisconnected(){	
    for(var i in PLAYER_LIST){
        var player = PLAYER_LIST[i];
        if(player.destroy == true){    
        	PLAYERS--;

            if(PLAYER_MATCH[player.id] != undefined){
                gameOver(player.id, PLAYER_MATCH[player.id], PLAYER_MATCH[player.id]);
            }

	        delete PLAYER_LIST[player.id];
        }
    }
<<<<<<< HEAD
    sendData(computeData());
=======
    sendChat(computeChat());
>>>>>>> 6c2bbfff19f255414cfa6c9a99f0d4d778e78ad0
}

function computeChat(){	
    var gameData = [];
    for(var i in PLAYER_LIST){
        var player = PLAYER_LIST[i];

        gameData.push({
            id: player.id,
            name: player.name
        });
    }
    return gameData;
}

function sendChat(data){	
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

function makeGame(id1, id2){
    PLAYER_MATCH[id1] = id2;
    PLAYER_MATCH[id] = id1;
    SOCKET_LIST[id1].emit("play start", id2);
    SOCKET_LIST[id2].emit("play start", id1);
    var game = Game(id1, id2);    
    GAME_LIST[id1 + "" + id2] = game;
    // javascript will send the reference here
    GAME_LIST[id2 + "" + id1] = game;
    game.creeps1.puhs(Creep(0, "creep_radiant", "base", "fountain"));
}

function gameOver(id1, id2, winner){    
    PLAYER_MATCH[id1] = undefined;
    PLAYER_MATCH[id2] = undefined;
    if(SOCKET_LIST[id1] != undefined)
    SOCKET_LIST[id1].emit("game over", winner);
    if(SOCKET_LIST[id2] != undefined)
    SOCKET_LIST[id2].emit("game over", winner);
    GAME_LIST[id1 + "" + id2] = undefined;
    GAME_LIST[id2 + "" + id1] = undefined;
}

function updateGames(){
    for(var i in GAME_LIST){
        var game = GAME_LIST[i];

        //process inputs, update creeps

        game.input1 = undefined;
        game.input2 = undefined;
    }
}

function computeGame(game){ 
    var gameData = [];
    // maybe later compute field of view
    for(var i in game.creeps1){
        var creep = game.creeps1[i];

        gameData.push(creep);
    }
    for(var i in game.creeps2){
        var creep = game.creeps1[i];

        gameData.push(creep);
    }
    return gameData;
}

function sendGame(data, id){
    var socket = SOCKET_LIST[id];
    socket.emit('game event', data);
}

function updatePlayers(){
	connectNewPlayers();

	removeDisconnected();

    findGames();

    updateGames();

    for (var i in GAME_LIST) {
        sendGame(computeGame(GAME_LIST[i].player1_id), GAME_LIST[i].player1_id);
        sendGame(computeGame(GAME_LIST[i].player2_id), GAME_LIST[i].player2_id);
    }
}

setInterval(updatePlayers, timeStep);

var Player = function(id, name, room){
    var self = {
    	room: room,
    	name:name,
        id:id,
    }
    return self;
};

var Creep = function(id, name, node, next){
    var self = {
        id : id,
        name: name,
        node: node, // current node
        next: next, // next node
        dist: 0, // distance from current to next node
        buffs: {}, // map
    };
    return self;
}

<<<<<<< HEAD
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
=======
var Input = function(heroid, x, y){
    var self = {
        heroid : heroid,
        x : x,
        y : y,
    };
    return self;
}

var Game = function(player1_id, player2_id){
    var self = {
        player1_id: player1_id,
        player2_id: player2_id,
        input1 : undefined,
        input2 : undefined,
        creeps1 : [],
        creeps2 : [],
    };
    return self;
>>>>>>> 6c2bbfff19f255414cfa6c9a99f0d4d778e78ad0
};

http.listen(3000, function(){
  console.log('listening on *:3000');
  createMap();
});