// You can use either `new PIXI.WebGLRenderer`, `new PIXI.CanvasRenderer`, or `PIXI.autoDetectRenderer`
// which will try to choose the best renderer for the environment you are in.
var renderer = new PIXI.autoDetectRenderer(1024, 700, {transparent: true});

// The renderer will create a canvas element for you that you can then insert into the DOM.
$('#canvasHolder').append(renderer.view);

// You need to create a root container that will hold the scene you want to draw.
var stage = new PIXI.Container();
var PLAYERS = [];
var MAX_PLAYERS = 100;
var BIG_NR = -100000;

var camera = new PIXI.Container();
camera.scale.x = 0.5;
camera.scale.y = 0.5;
camera.position.x = 500;
camera.position.y = 350;

var graphics = new PIXI.Graphics();
 
// Set the fill color
graphics.beginFill(0xe74c3c); // Red
 
// Draw a circle
graphics.drawCircle(0, 0, 700); // drawCircle(x, y, radius)
 
// Applies fill to lines and shapes since the last call to beginFill.
graphics.endFill();
  
// Add the graphics to the stage
camera.addChild(graphics);

// load the texture we need
PIXI.loader.add('gear', 'gear2.png').load(function (loader, resources) {
    
    for (var i = 0; i < MAX_PLAYERS; i++) {
        var player = new PIXI.Sprite(resources.gear.texture);
        var text = new PIXI.Text("Heya!", {font:"30px Arial", fill:"black"});

        text.position.y = -50;

        var playerContainer = new PIXI.Container();
        // Setup the position and scale of the bunny

        player.anchor.x = 0.5;
        player.anchor.y = 0.5;

        player.scale.x = 1;
        player.scale.y = 1;
        // Add the bunny to the scene we are building.
        playerContainer.addChild(text);
        playerContainer.addChild(player); 

        PLAYERS.push(playerContainer);

        camera.addChild(playerContainer)
    }

    for(var i = 0; i< PLAYERS.length; i++){
        PLAYERS[i].position.x = BIG_NR;
        PLAYERS[i].position.y = BIG_NR;        
    }
    // kick off the animation loop (defined below)
    animate();
});       
   
stage.addChild(camera);

var socket = io();

$(window).on('beforeunload', function(){
    socket.close();
});

function rgbToHex(r, g, b) {
    return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function getColor(name){
    var col = 0;
    for(var i=0; i<name.length; i++){
        col+=name[i].charCodeAt(0);
    }
    col*=1234;
    col%=16581375;
    return col;
}


socket.on('gameEvent',function(data){
    var n = data.length;
    if(PLAYERS.length < n){
        n = PLAYERS.length;
    }
    for(var i = 0 ; i < n; i++){
        PLAYERS[i].position.x = data[i].x;
        PLAYERS[i].position.y = -data[i].y;
        PLAYERS[i].getChildAt(1).rotation = data[i].ang;
        PLAYERS[i].getChildAt(0).text = data[i].name;
        PLAYERS[i].getChildAt(0).position.x = -data[i].name.length*8;
        PLAYERS[i].getChildAt(1).tint = getColor(data[i].name);
    console.log(data[i].name);
    }
});

socket.on('chat',function(chat){
    $('#messages').append("<li>" + chat + "</li>");
});

function animate() {
    // start the timer for the next animation loop
    requestAnimationFrame(animate);

    // this is the main render call that makes pixi draw your container and its children.
    renderer.render(stage);
}