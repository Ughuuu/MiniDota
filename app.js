"use strict";
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var favicon = require('serve-favicon');

app.use(express.static(__dirname + '/'));

app.use(favicon(__dirname + '/res/jugg.png'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/html/index.html');
});

var TEST = false;
var DEBUG = true;
var PORT = (process.env.PORT || 5000);
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
var SUBDIVISIONS = 20;
var GRID = [];
var DISTANCES = {};
var TEST_DATA = {};
var VISITED_INDEX = 1;
var PATH = {};

io.on('connection', function (socket) {
    socket.id = GLOBAL_PLAYER_ID + 1;
    GLOBAL_PLAYER_ID++;
    SOCKET_LIST[socket.id] = socket;
    
    socket.on('make player', function (name) {
        if (PLAYER_LIST[socket.id] != undefined)
            return;
        PLAYERS++;
        NEW_PLAYER_LIST.add({ id: socket.id, name: name.name });
    });
    
    socket.on('play request', function (input) {
        if (PLAYER_LIST[socket.id] == undefined || 
            PLAYER_MATCH[socket.id] != undefined || 
            PLAYER_FIND_LIST.has(socket.id)) {
            SOCKET_LIST[socket.id].emit("play registered", false);
        } else {
            SOCKET_LIST[socket.id].emit("play registered", true);
            PLAYER_FIND_LIST.add(socket.id);
        }
    });
    
    socket.on('chat message', function (msg) {
        var player = new Object();
        player.name = PLAYER_LIST[socket.id].name;
        player.msg = msg;
        io.emit('chat message', player);
    });
    
    socket.on('play input', function (input) {
        var id2 = PLAYER_MATCH[socket.id];
        if (input.x < 0) {
            input.x = 0;
        } else
            if (input.x > 1000) {
                input.x = 1000;
            }
        if (input.y < 0) {
            input.y = 0;
        } else
            if (input.y > 920) {
                input.y = 920;
            }
        if (id2 != undefined) {
            var game = GAME_LIST[socket.id + "" + id2];
            if (game.player1_id == socket.id) {
                game.input1 = input;
            } else {
                game.input2 = input;
            }
        }
        TEST_DATA['test_game'].input1 = input;
    });
    
    socket.on('disconnect', function () {
        delete SOCKET_LIST[socket.id];
        if (PLAYER_LIST[socket.id] == undefined)
            return;
        PLAYER_LIST[socket.id].destroy = true;
        PLAYERS--;
    });
});

function connectNewPlayers() {
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

function removeDisconnected() {
    for (var i in PLAYER_LIST) {
        var player = PLAYER_LIST[i];
        if (player.destroy == true) {
            PLAYERS--;
            
            if (PLAYER_MATCH[player.id] != undefined) {
                gameOver(player.id, PLAYER_MATCH[player.id], PLAYER_MATCH[player.id]);
            }
            
            delete PLAYER_LIST[player.id];
        }
    }
    sendChat(computeChat());
}

function computeChat() {
    var gameData = [];
    for (var i in PLAYER_LIST) {
        var player = PLAYER_LIST[i];
        
        gameData.push({
            id: player.id,
            name: player.name
        });
    }
    return gameData;
}

function sendChat(data) {
    for (var i in SOCKET_LIST) {
        var socket = SOCKET_LIST[i];
        socket.emit('chat event', data);
    }
}

function findGames() {
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
        if (PLAYER_FIND_LIST.size % 2 == 1) {
            var player = PLAYER_FIND_LIST[PLAYER_FIND_LIST.size - 1];
            PLAYER_FIND_LIST = [];
            PLAYER_FIND_LIST.push(player);
        } else {
            PLAYER_FIND_LIST.clear();
        }
    }
}

function spawnRosh(game){
    game.addCreep(Creep("roshan", "515", "529", 0), "neutral");
}

function spawnCreeps(game, faction) {
    for (var i = 0; i < 1; i++) {
        game.addCreep(Creep("creep_radiant", "35", "36", i * 3), faction);
        game.addCreep(Creep("creep_dire", "35", "36", i * 3), faction);
        game.addCreep(Creep("creep_radiant", "35", "36", i * 3), faction);
    }
}

function testCreeps(game) {
    game.addCreep(Creep("viper", "386", "386", 0), "dire");
    game.addCreep(Creep("tiny", "460", "460", 0), "dire");
    game.addCreep(Creep("pudge", "474", "474", 0), "dire");
    game.addCreep(Creep("axe", "203", "203", 0), "dire");
    game.addCreep(Creep("alchemist", "206", "206", 0), "dire");

    game.addCreep(Creep("abaddon", "406", "406", 0), "radiant");
    game.addCreep(Creep("templar_assassin", "434", "434", 0), "radiant");
    game.addCreep(Creep("zeus", "338", "338", 0), "radiant");
    game.addCreep(Creep("jakiro", "339", "339", 0), "radiant");
    game.addCreep(Creep("ursa", "305", "305", 0), "radiant");

    makeTowers(game);
    spawnCreeps(game, "radiant");
    spawnRosh(game);
    game.addCreep(Creep("observer", "300", "300", 0), "radiant");
    game.addCreep(Creep("observer", "291", "291", 0), "radiant");
    game.addCreep(Creep("observer", "318", "318", 0), "radiant");
    game.addCreep(Creep("sentry", "444", "444", 0), "radiant");
    for (var i in MAP) {
        //game.addCreep(Creep("creep_radiant", i, i, 0), "radiant");
    }
}

function makeTowers(game){    
    game.addCreep(Creep("tower_radiant", "418", "418", 0), "radiant");
    game.addCreep(Creep("tower_radiant", "85", "85", 0), "radiant");
    game.addCreep(Creep("tower_radiant", "275", "275", 0), "radiant");
    game.addCreep(Creep("tower_radiant", "427", "427", 0), "radiant");
    game.addCreep(Creep("tower_radiant", "86", "86", 0), "radiant");
    game.addCreep(Creep("tower_radiant", "164", "164", 0), "radiant");
    game.addCreep(Creep("tower_radiant", "78", "78", 0), "radiant");
    game.addCreep(Creep("tower_radiant", "334", "334", 0), "radiant");
    game.addCreep(Creep("tower_radiant", "398", "398", 0), "radiant");


    game.addCreep(Creep("tower_dire", "207", "207", 0), "dire");
    game.addCreep(Creep("tower_dire", "452", "452", 0), "dire");
    game.addCreep(Creep("tower_dire", "224", "224", 0), "dire");
    game.addCreep(Creep("tower_dire", "151", "151", 0), "dire");
    game.addCreep(Creep("tower_dire", "473", "473", 0), "dire");
    game.addCreep(Creep("tower_dire", "144", "144", 0), "dire");
    game.addCreep(Creep("tower_dire", "118", "118", 0), "dire");
    game.addCreep(Creep("tower_dire", "383", "383", 0), "dire");
    game.addCreep(Creep("tower_dire", "362", "362", 0), "dire");
}

function makeGame(id1, id2) {
    PLAYER_MATCH[id1] = id2;
    PLAYER_MATCH[id2] = id1;
    SOCKET_LIST[id1].emit("play start", id2);
    SOCKET_LIST[id2].emit("play start", id1);
    var game = Game(id1, id2);
    GAME_LIST[id1 + "" + id2] = game;
    GAME_LIST[id2 + "" + id1] = game;
    
    spawnCreeps(GAME_LIST[id1 + "" + id2], "radiant");
    
    makeTowers(GAME_LIST[id1 + "" + id2]);

    //testCreeps(GAME_LIST[id1 + "" + id2]);
}

function gameOver(id1, id2, winner) {
    delete PLAYER_MATCH[id1];
    delete PLAYER_MATCH[id2];
    if (SOCKET_LIST[id1] != undefined)
        SOCKET_LIST[id1].emit("game over", winner);
    if (SOCKET_LIST[id2] != undefined)
        SOCKET_LIST[id2].emit("game over", winner);
    delete GAME_LIST[id1 + "" + id2];
    delete GAME_LIST[id2 + "" + id1];
}

function findNode(input) {
    var dist = 99999999999;
    var pos = { x: input.x, y: input.y };
    var node_name;
    for (var i in MAP) {
        var pos2 = { x: MAP[i].x, y: MAP[i].y };
        var dist2 = (pos.x - pos2.x) * (pos.x - pos2.x) + (pos.y - pos2.y) * (pos.y - pos2.y);
        if (dist2 < dist) {
            dist = dist2;
            node_name = i;
        }
    }
    console.log(node_name);
    return node_name;
}

function findPath(node1, node2) {
    if(node1 == node2){
        return [];
    }
    if (PATH[node1 + "," + node2] == undefined) {
        var queue = [node1];
        var path = [node2];
        MAP[node1].walk = 0;
        while (queue.length != 0) {
            var node = queue.shift();
            MAP[node].visited = VISITED_INDEX;
            for (var j in MAP[node].neighbours) {
                var neigh = MAP[node].neighbours[j];
                if (MAP[neigh].visited != VISITED_INDEX) {
                    
                    MAP[neigh].visited = VISITED_INDEX;
                    MAP[neigh].walk = MAP[node].walk + distance(MAP[node], MAP[neigh]).len;
                    
                    
                    queue.push(neigh);
                } else {
                    MAP[neigh].walk = Math.min(MAP[neigh].walk, MAP[node].walk + distance(MAP[node], MAP[neigh]).len);

                }
            }
        }
        
        var node = MAP[node2];
        
        while (node.id != node1) {
            var minVal = node.walk;
            var nodeAlt;
            for (var j in node.neighbours) {
                var neigh = node.neighbours[j];
                if (MAP[neigh].walk < minVal) {
                    nodeAlt = MAP[neigh];
                    minVal = MAP[neigh].walk;
                }
            }
            path.push(nodeAlt.id);
            node = nodeAlt;
        }
        
        PATH[node1 + "," + node2] = path.reverse();
        //PATH[node1 + "," + node2] = path.slice();
        //PATH[node1 + "," + node2].reverse();
    }
    return PATH[node1 + "," + node2];
}

function updateGame(game) {
    //process inputs, update creeps
    VISITED_INDEX++;
    if (game.input1 != undefined) {
        var creep = game.creeps[0][game.input1.id];

        if(creep != undefined){
            creep.state = "move";
            var node_name = findNode(game.input1);        
            
            creep.path = findPath(creep.next, node_name);
        }
    }    

    if (game.input2 != undefined) {
        var creep = game.creeps[1][game.input2.id];
        
        if(creep != undefined){
            creep.state = "move";
            var node_name = findNode(game.input2);        
            
            creep.path = findPath(creep.next, node_name);
        }
    }

    game.input1 = undefined;
    game.input2 = undefined;
    
    for (var i in game.creeps) {
        for(var j in game.creeps[i]){
            game.creeps[i][j].move();
        }
    }
}

function computeGame(creeps) {
    var gameData = [];
    // maybe later compute field of view
    for (var i in creeps) {
        for(var j in creeps[i]){
            var creep = creeps[i][j];
            var pos = creep.pos();
            
            gameData.push({ x: pos.x, y: pos.y, name: creep.name, ang: 0, id: creep.id, h: pos.h });
        }
    }
    return gameData;
}

function sendGame(data, id) {
    var socket = SOCKET_LIST[id];
    socket.emit('game event', data);
}

function updatePlayers() {
    connectNewPlayers();
    
    removeDisconnected();
    
    findGames();
    
    for (var i in GAME_LIST) {
        var game = GAME_LIST[i];
        updateGame(game);
    }
    
    updateGame(TEST_DATA['test_game']);
    
    for (var i in GAME_LIST) {
        sendGame(computeGame(GAME_LIST[i].creeps), GAME_LIST[i].player1_id);
        sendGame(computeGame(GAME_LIST[i].creeps), GAME_LIST[i].player2_id);
    }
    
    if (DEBUG)
        for (var i in SOCKET_LIST) {
            sendGame(computeGame(TEST_DATA["test_game"].creeps), i);
        }
}

setInterval(updatePlayers, timeStep);

var Player = function (id, name, room) {
    var self = {
        room: room,
        name: name,
        id: id,
    }
    return self;
};

function distance(node1, node2) {
    if (DISTANCES[node1.id + "" + node2.id] == undefined) {
        var len = Math.sqrt((node1.x - node2.x) * (node1.x - node2.x) + (node1.y - node2.y) * (node1.y - node2.y));
        if (len < 0.0001)
            len = 0.0001;
        var x = (node2.x - node1.x) / len;
        var y = (node2.y - node1.y) / len;
        DISTANCES[node1.id + "" + node2.id] = { len: len, x: x, y: y };
        DISTANCES[node2.id + "" + node1.id] = { len: len, x: -x, y: -y };
    }
    return DISTANCES[node1.id + "" + node2.id];
}

var Creep = function (name, node, next, dist) {
    var self = {
        id : -1,
        name: name,
        hp: 100,
        node: node, // current node
        next: next, // next node
        dist: dist, // distance from current to next node
        buffs: {}, // map
        path: [],
        ms: 8,
        state: "hold",
        pos : function () {
            var dir = distance(MAP[this.node], MAP[this.next]);
            var h = MAP[this.node].height;
            if (MAP[this.next].height != h) {
                var proc = this.dist / dir.len, inv = 1 - proc;
                h = h * inv + MAP[this.next].height * proc;
            }
            return { x: (MAP[this.node].x + dir.x * this.dist), y: MAP[this.node].y + dir.y * this.dist, h: h };
        },
        move: function () {
            if(this.state != "move")
                return;
            var dir = distance(MAP[this.node], MAP[this.next]);
            this.dist += this.ms;
            if (this.dist > dir.len) {
                this.dist -= dir.len;
                this.node = this.next;
                if (this.path.length > 0) {// move forward
                    this.next = this.path[0];
                    this.path.splice(0, 1);
                } else {// stay in place
                    if (DEBUG && TEST) {
                        this.next = this.node;
                        var nr = ~~(MAP[this.node].neighbours.length * (Math.random() - 0.01));
                        if (MAP[this.node].neighbours.length <= nr)
                            nr = MAP[this.node].neighbours.length;
                        this.next = MAP[this.node].neighbours[nr];
                        if (this.next == undefined || MAP[this.next] == undefined) {
                            this.next = this.node;
                        }
                    } else {
                        this.dist = 0;
                    }
                }
            }
        }
    };
    return self;
};

var Node = function (x, y, height, id, neighbours) {
    var self = {
        id: id,
        neighbours: neighbours,
        x: x,
        y: y,
        height: height,
        addNeigh: function (name) {
            this.neighbours.push(name);
        },
        visited: 0,
        walk: 0,
    };
    return self;
};

var createMap = function () {
    var fs = require('fs');
    var lines = fs.readFileSync('map.graph').toString().split("\n");
    // windows shit
    if (lines[0][lines[0].length - 1] == '\r') {
        lines = fs.readFileSync('map.graph').toString().split("\r\n");
    }
    var n = 0;
    for (n = 0; ; ++n) {
        var details = lines[n].toString().split(' ');
        if (!(details[1][0] >= '0' && details[1][0] <= '9')) {
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

var loadMap = function () {
    var fs = require('fs');
    MAP = JSON.parse(fs.readFileSync('map1.graph'));
    for (var i in MAP) {
        MAP[i] = new Node(MAP[i].x, MAP[i].y, MAP[i].height, MAP[i].id, MAP[i].neighbours);
        var ok = false;
        while (ok == false) {
            ok = true;
            for (var j in MAP[i].neighbours) {
                if (MAP[MAP[i].neighbours[j]] == undefined) {
                    MAP[i].neighbours.splice(j, 1);
                    j--;
                    ok = false;
                }
            }
        }
    }
};

var Input = function (heroid, x, y) {
    var self = {
        id : id,
        x : x,
        y : y,
    };
    return self;
};

var Game = function (player1_id, player2_id) {
    var self = {
        player1_id: player1_id,
        player2_id: player2_id,
        input1 : undefined,
        input2 : undefined,
        creeps : [], // 0 player 1, 1 player 2, 2 neutrals
        creep_id: 0,
        addCreep: function (creep, faction) {
            creep.id = this.creep_id;
            this.creep_id++;
            var idx = 0;
            if(faction == "radiant")
                idx = 0;
            else if(faction == "dire")
                idx = 1;
            else if(faction == "neutral")
                idx = 2;
            this.creeps[idx][creep.id] = creep;
        }
    };
    self.creeps.push({});// radiant
    self.creeps.push({});// dire
    self.creeps.push({});// neutrals
    return self;
};

http.listen(PORT, function () {
    console.log('listening on port: ' + PORT);
    loadMap();
    
    if (DEBUG) {
        TEST_DATA["test_game"] = Game(0, 0);
        testCreeps(TEST_DATA["test_game"]);
    }
});