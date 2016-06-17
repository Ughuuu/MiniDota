"use strict";
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

var DEBUG = true;
var PORT = 3000;
var SOCKET_LIST = {};
var PLAYER_LIST = {};
var NEW_PLAYER_LIST = new Set();
var PLAYER_FIND_LIST = new Set();
var PLAYER_MATCH = {};
var GAME_LIST = {};
var GLOBAL_PLAYER_ID = 0;
var PLAYERS = 0;
var timeStep = 1000 / 30.0;
var MAP = {};
var DISTANCES = {};
var TEST_DATA = {};

io.on('connection', function(socket){
	socket.id = GLOBAL_PLAYER_ID + 1;
    GLOBAL_PLAYER_ID++;
	SOCKET_LIST[socket.id] = socket;

	socket.on('make player',function(name){
    	if(PLAYER_LIST[socket.id] != undefined)
    		return;
		PLAYERS++;
	 	NEW_PLAYER_LIST.add({id:socket.id, name:name.name});
    });

    socket.on('play request', function(input){
        if(PLAYER_LIST[socket.id] == undefined || 
            PLAYER_MATCH[socket.id] != undefined || 
            PLAYER_FIND_LIST.has(socket.id)){
            SOCKET_LIST[socket.id].emit("play registered", false);
        }else {
            SOCKET_LIST[socket.id].emit("play registered", true);
            PLAYER_FIND_LIST.add(socket.id);
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
        if(input.x<0){
            input.x = 0;
        }else
        if(input.x> 1000){
            input.x = 1000;
        }
        if(input.y<0){
            input.y = 0;
        }else
        if(input.y> 920){
            input.y = 920;
        }
        if(id2 != undefined){
            var game = GAME_LIST[socket.id + "" + id2];
            if(game.player1_id == socket.id){
                game.input1 = input;
            }else{
                game.input2 = input;
            }
        }
        console.log(TEST_DATA['test_game'].creeps1[input.id].pos());
        console.log(input);
    });

	socket.on('disconnect',function(){
	    delete SOCKET_LIST[socket.id];
    	if(PLAYER_LIST[socket.id] == undefined)
    		return;
    	PLAYER_LIST[socket.id].destroy = true;
		PLAYERS--;
    });
});

function connectNewPlayers(){
	for (let obj of NEW_PLAYER_LIST) {
		var id = obj.id;
		var name = obj.name;
		if(PLAYER_LIST[id] != undefined){
			continue;
		}
	    var player = Player(id, name);
	    PLAYER_LIST[id] = player;
	}
	if (NEW_PLAYER_LIST.size) {
		sendChat(computeChat());
		NEW_PLAYER_LIST.clear();
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
    sendChat(computeChat());
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
    var last = undefined;
    for (let id of PLAYER_FIND_LIST) {
        // here get player, maybe later we might compute mmr or something
        var player = PLAYER_LIST[id];
        if(last == undefined){
            last = player;
        }else{
            makeGame(player.id, last.id);
            last = undefined;
        }
    }
    if (PLAYER_FIND_LIST.size != 1) {
        // save the last for further games
        if(PLAYER_FIND_LIST.size %2 == 1){
            var player = PLAYER_FIND_LIST[PLAYER_FIND_LIST.size-1];
            PLAYER_FIND_LIST = [];
            PLAYER_FIND_LIST.push(player);
        }else{
            PLAYER_FIND_LIST.clear();
        }
    }
}

function spawnCreeps(game, faction){
    for(var i = 0; i<200;i++){
        game.addCreep(Creep("creep_radiant", "35", "36", i*3), faction);
        game.addCreep(Creep("creep_dire", "35", "36", i*3), faction);
        game.addCreep(Creep("creep_radiant", "35", "36", i*3), faction);
    }
        game.addCreep(Creep("abaddon", "36", "36", 0), faction);
}

function testCreeps(game){
    spawnCreeps(game, "radiant");
    //for (var i in MAP) {
    //    game.addCreep(Creep("creep_radiant", i, i, 0), "radiant");
    //}
}

function makeGame(id1, id2){
    PLAYER_MATCH[id1] = id2;
    PLAYER_MATCH[id2] = id1;
    SOCKET_LIST[id1].emit("play start", id2);
    SOCKET_LIST[id2].emit("play start", id1);
    var game = Game(id1, id2);    
    GAME_LIST[id1 + "" + id2] = game;
    // javascript will send the reference here
    GAME_LIST[id2 + "" + id1] = game;

    spawnCreeps(GAME_LIST[id1 + "" + id2], "radiant");

    //testCreeps(GAME_LIST[id1 + "" + id2]);
}

function gameOver(id1, id2, winner){    
    delete PLAYER_MATCH[id1];
    delete PLAYER_MATCH[id2];
    if(SOCKET_LIST[id1] != undefined)
    SOCKET_LIST[id1].emit("game over", winner);
    if(SOCKET_LIST[id2] != undefined)
    SOCKET_LIST[id2].emit("game over", winner);
    delete GAME_LIST[id1 + "" + id2];
    delete GAME_LIST[id2 + "" + id1];
}

function updateGame(game){    
        //process inputs, update creeps

        game.input1 = undefined;
        game.input2 = undefined;

        for(var i in game.creeps1){
            game.creeps1[i].move();
        }

        for(var i in game.creeps2){
            game.creeps2[i].move();
        }
}

function computeGame(creeps1, creeps2){ 
    var gameData = [];
    // maybe later compute field of view
    for(var i in creeps1){
        var creep = creeps1[i];
        var pos = creep.pos();

        gameData.push({x: pos.x, y: pos.y, name: creep.name, ang: 0, id:creep.id});
    }
    for(var i in creeps2){
        var creep = creeps2[i];
        var pos = creep.pos();

        gameData.push({x: pos.x, y: pos.y, name: creep.name, ang: 0, id:creep.id});
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

    for(var i in GAME_LIST){
        var game = GAME_LIST[i];
        updateGame(game);
    }

    updateGame(TEST_DATA['test_game']);

    for (var i in GAME_LIST) {
        sendGame(computeGame(GAME_LIST[i].creeps1, GAME_LIST[i].creeps2), GAME_LIST[i].player1_id);
        sendGame(computeGame(GAME_LIST[i].creeps2, GAME_LIST[i].creeps1), GAME_LIST[i].player2_id);
    }

    if(DEBUG)
    for (var i in SOCKET_LIST){
        sendGame(computeGame(TEST_DATA["test_game"].creeps1, TEST_DATA["test_game"].creeps2), i);
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

function distance(node1, node2){
    if(DISTANCES[node1.id+""+node2.id] == undefined){
        var len = Math.sqrt((node1.x-node2.x)*(node1.x-node2.x) + (node1.y-node2.y)*(node1.y-node2.y));
        if(len < 0.0001)
            len = 0.0001;
        var x = (node2.x - node1.x)/len;
        var y = (node2.y - node1.y)/len;
        DISTANCES[node1.id+""+node2.id] = { len:len, x:x, y:y};
        DISTANCES[node2.id+""+node1.id] = { len:len, x:-x, y:-y};
    }
    return DISTANCES[node1.id+""+node2.id];
}

var Creep = function(name, node, next, dist){
    var self = {
        id : -1,
        name: name,
        hp: 100,
        node: node, // current node
        next: next, // next node
        dist: dist, // distance from current to next node
        buffs: {}, // map
        path: [],
        ms: 10,
        pos : function(){
            var dir = distance(MAP[this.node], MAP[this.next]);
            return { x: (MAP[this.node].x + dir.x * this.dist), y: MAP[this.node].y + dir.y * this.dist };
        },
        move: function(){
            var dir = distance(MAP[this.node], MAP[this.next]);
            this.dist+=this.ms;
            if(this.dist>dir.len){
                this.dist -= dir.len;
                var aux = this.node;
                this.node = this.next;
                if(this.path.length>0){// move forward
                    this.next = this.path[0];
                    this.path.splice(0, 1);
                }else{// stay in place
                    //this.next = this.node;
                    var nr = ~~(MAP[this.node].neighbours.length * (Math.random()-0.01));
                    if(MAP[this.node].neighbours.length <= nr)
                        nr = MAP[this.node].neighbours.length-1;
                    //console.log(MAP[this.node].neighbours.length + " " + nr);
                    this.next = MAP[this.node].neighbours[nr];
                    if(this.next == undefined || MAP[this.next] == undefined){
                        this.next = this.node;
                    }
                }
            }
        }
    };
    return self;
};

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
    // windows shit
    if(lines[0][lines[0].length-1]=='\r'){
        lines = fs.readFileSync('map.graph').toString().split("\r\n");
    }
    var n = 0;
    for (n = 0; ; ++n) {
        var details = lines[n].toString().split(' ');
        if(!(details[1][0]>='0' && details[1][0]<='9')){
            break;
        }
        MAP[details[0]] = Node(+details[1], +details[2], +details[3], details[0]);
    }
    for (var i = n; i < lines.length; ++i) {
        var nodes = lines[i].toString().split(' ');
        for (var j = 0; j < nodes.length - 1; ++j) {
            MAP[nodes[j]].addNeigh(MAP[nodes[j + 1]].id);
            MAP[nodes[j + 1]].addNeigh(MAP[nodes[j]].id);
        }
    }
};

var loadMap = function() {
    var fs = require('fs');
    MAP = JSON.parse(fs.readFileSync('map1.graph'));
    for(var i in MAP){
        for(var j in MAP[i].neighbours){
            if(MAP[MAP[i].neighbours[j]] == undefined){
                MAP[i].neighbours.splice(j,1);
                j--;
            }
        }
    }
};

var Input = function(heroid, x, y){
    var self = {
        heroid : heroid,
        x : x,
        y : y,
    };
    return self;
};

var Game = function(player1_id, player2_id){
    var self = {
        player1_id: player1_id,
        player2_id: player2_id,
        input1 : undefined,
        input2 : undefined,
        creeps1 : {},
        creeps2 : {},
        creep_id: 0,
        addCreep: function(creep, faction){
            creep.id = this.creep_id;
            this.creep_id++;
            if(faction == "radiant"){
                this.creeps1[creep.id]=creep;
            }else if(faction == "dire"){
                this.creeps2[creep.id]=creep;
            }
        }
    };
    return self;
};

http.listen(PORT, function(){
    console.log('listening on port: ' + PORT);
    loadMap();

    if(DEBUG){
        TEST_DATA["test_game"] = Game(0,0);
        testCreeps(TEST_DATA["test_game"]);
    }
});