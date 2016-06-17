app.controller('InGame', ['$scope', '$mdToast', function($scope, $mdToast) {
    var renderer;
    var stage;
    var camera;
    var width = 1024;
    $scope.height = 524;
    var refwidth = 1024;
    var refheight = 524;
    var MAP;
    var MAX_PLAYERS = 401;
    var START_X = 290;
    var START_Y = 490;
    var PLAYERS = [];
    var LINES;
    var res;
    var scale = 1;
    var chat_size = 100;
    $scope.actwidth = 1024;
    $scope.play_text = "Add";
    var heroes;
    var selected = undefined;
    $scope.play = function(){
        if($scope.play_text == "Add")
        $scope.play_text = "Link";
        else
            $scope.play_text = "Add";
    };
    var animate = function () {
        renderer.render(stage);
        requestAnimationFrame(animate);
    };
    var mouseClick = function(mouseData){
        if($scope.play_text == "Add"){
            if(this.id == -1){
                var pos = mouseData.data.getLocalPosition(MAP);
                var input = {x: pos.x-10, y: pos.y+20};
                input.x-=12;
                input.y-=967;
                input.y*=-1;
                socket.emit("add map", input);            
            }else{
                socket.emit("remove map", {id:this.id});
            }
        }else{
            if(this.id == -1){         
            }else{
                if(selected != undefined){
                    socket.emit("link map", 
                        {id1: this.id, id2: selected.id});  
                    selected.tint = 0xFFFFFF; 
                    selected = undefined;
                }else{
                    selected = this;
                    selected.tint = 0x110022;
                }
            }
        }
    };
    var doneload = function (loader, resources) {
        res = resources;
        MAP = new PIXI.Sprite(res.map.texture);
        MAP.id = -1;
        var mapfg = new PIXI.Sprite(res.mapfg.texture);
        MAP.interactive = true;
        MAP.mouseup = mouseClick;
        scale = refheight/1120;
        MAP.scale.x = scale;
        MAP.scale.y = scale;
        MAP.position.x = refwidth/2-MAP.width/2+7;
        MAP.position.y = 48;
        mapfg.scale.x = refheight/524;
        mapfg.scale.y = refheight/524;
        camera.addChild(MAP);
        heroes = res.chibi.textures;
        for (var i = 0; i < MAX_PLAYERS; i++) {
            var player = new PIXI.Sprite(heroes["creep_dire"]);
            player.id = -1;
            player.interactive = true;
            player.mouseup = mouseClick;

            player.anchor.x = 0.5;
            player.anchor.y = 0.5;

            player.scale.x = 0.2;
            player.scale.y = 0.2;

            PLAYERS.push(player);
        }

        for(var i = 0; i< PLAYERS.length; i++){
            PLAYERS[i].position.x = 0;
            PLAYERS[i].position.y = 0;

            camera.addChild(PLAYERS[i]);
        }

        camera.addChild(mapfg);
        animate();
    };
    var startload = function(){
        PIXI.loader.add('minidota', 'res/minidota.png')
                   .add('jugg', 'res/jugg.png')
                   .add('map', 'res/map.png')
                   .add('mapfg', 'res/mapfg.png')
                   .add('holder', 'res/holder.png')
                   .add('chibi', 'res/chibi.json')
                   //.add('holder', 'res/holder.png')
                   //.add('font', 'res/04B_03__.fnt')
        .load(doneload);
    };
    var init = function () {
        startload();

        PIXI.Sprite.prototype.id = -1;

        width = window.innerWidth;
        $scope.height = width / 2;
        renderer = new PIXI.autoDetectRenderer(width, $scope.height);
        renderer.backgroundColor = 0x283593;
        renderer.view.style.left = ((window.innerWidth - renderer.width) >> 1) + 'px';
        renderer.view.style.display = "block";
        renderer.autoResize = true;
        $('#canvas_holder').append(renderer.view);
        $('')
        stage = new PIXI.Container();
        camera = new PIXI.Container();
        LINES = new PIXI.Graphics();
        // init camera to center, it shouldn't ever move
        camera.scale.x = 1;
        camera.scale.y = 1;
        camera.position.x = 0;
        camera.position.y = 0;
        
        stage.addChild(camera);

        $scope.resize();
        window.onresize = $scope.resize;
    };
    $scope.resize = function (event){
        $scope.actwidth = window.innerWidth;
        width = Math.min(window.innerWidth, (window.innerHeight-chat_size)*2);
        $scope.height = width / 2;

        renderer.view.style.width = width + "px";
        renderer.view.style.height = $scope.height + "px";
        camera.scale.x = width/1024;
        camera.scale.y = width/1024;

        renderer.resize(width, $scope.height);
    };
    init();
    function rgbToHex(r, g, b) {
        return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }
    socket.on('game event',function(data){
        var n = data.length;
        if(PLAYERS.length < n){
            n = PLAYERS.length;
        }
        for(var i = 0 ; i < n; i++){
            PLAYERS[i].id = data[i].id;
            PLAYERS[i].texture = heroes[data[i].name];
            PLAYERS[i].position.x = data[i].x*scale + START_X;
            PLAYERS[i].position.y = -data[i].y*scale + START_Y;
            PLAYERS[i].rotation = data[i].ang;
        }
        for(var i = n ; i < PLAYERS.length; i++){
            PLAYERS[i].id = -1;
            PLAYERS[i].texture = heroes["abaddon"];
            PLAYERS[i].position.x = 0;
            PLAYERS[i].position.y = 0;
            PLAYERS[i].rotation = 0;
        }
    });
    socket.on('whole map',function(map){
        camera.removeChild(LINES);
        LINES = new PIXI.Graphics();
        LINES.beginFill(0x00FF00);
        LINES.lineStyle(2, 0xAAAAAA);
        for(var i in map){
            for(var j in map[i].neighbours){
                var id = map[i].neighbours[j];
                if(map[id] == undefined){
                    continue;
                }
                LINES.moveTo(map[i].x*scale + START_X, -map[i].y*scale + START_Y);                
                LINES.lineTo(map[id].x*scale + START_X, -map[id].y*scale + START_Y);
            }            
        }
        LINES.endFill();
        camera.addChild(LINES);
    });
}]);
