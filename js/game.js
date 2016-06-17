app.controller('InGame', ['$scope', '$mdToast', function($scope, $mdToast) {
    var graphics;
    var renderer;
    var stage;
    var camera;
    var width = 1024;
    $scope.height = 524;
    var refwidth = 1024;
    var refheight = 524;
    var MAP;
    var MAX_PLAYERS = 801;
    var START_X = 290;
    var START_Y = 490;
    var PLAYERS = [];
    var SHADOWS = [];
    var SHADOW_ON = true;
    var res;
    var scale = 1;
    var chat_size = 100;
    $scope.actwidth = 1024;
    $scope.play_disabled = false;
    $scope.play_text = "Play";
    var heroes;
    var selected = undefined;
    $scope.play = function(){
        socket.emit('play request', true);
        $scope.play_disabled = true;
        $scope.play_text = "Find";
    };
    var animate = function () {
        renderer.render(stage);
        requestAnimationFrame(animate);
    };
    var select = function(mouseData){
        var pos = mouseData.data.getLocalPosition(MAP);
        var input = {id: selected.id, x: pos.x, y: pos.y};
        input.x-=12;
        input.y-=967;
        input.y*=-1;
        socket.emit("play input", input);
    }
    var mouseClick = function(mouseData){
        if(selected != undefined){
            select(mouseData);
            selected.tint = 0xFFFFFF;
            selected = undefined;
        }else if(this.id!=-1){            
            selected = this;
            selected.tint = 0x667777;
        }
    };
    var doneload = function (loader, resources) {
        res = resources;
        MAP = new PIXI.Sprite(res.map.texture);
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
            player.interactive = true;
            player.mouseup = mouseClick;

            player.anchor.x = 0.5;
            player.anchor.y = 0.5;

            player.scale.x = 0.4;
            player.scale.y = 0.4;

            PLAYERS.push(player);

            if(SHADOW_ON){
                var shadow = new PIXI.Sprite(heroes["creep_dire"]);
                shadow.anchor.x = 0.07;
                shadow.anchor.y = 0.8;

                shadow.scale.x = 0.3;
                shadow.scale.y = 0.5;
                shadow.rotation = 1;
                shadow.tint = 0x000000;
                shadow.alpha = 0.4;
                SHADOWS.push(shadow);
            }
        }

        if(SHADOW_ON){
            for(var i = 0; i< SHADOWS.length; i++){
                SHADOWS[i].position = PLAYERS[i].position;

                camera.addChild(SHADOWS[i]);
            }
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
        graphics = new PIXI.Graphics();
        renderer = new PIXI.autoDetectRenderer(width, $scope.height);
        renderer.backgroundColor = 0x283593;
        renderer.view.style.left = ((window.innerWidth - renderer.width) >> 1) + 'px';
        renderer.view.style.display = "block";
        renderer.autoResize = true;
        $('#canvas_holder').append(renderer.view);
        $('')
        stage = new PIXI.Stage(0x66FF99, true);
        camera = new PIXI.Container();
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
    socket.on('play registered',function(data){
        if(data == true){
            $scope.play_text = "Wait";
        }else{
            $scope.play_text = "Error";
            $mdToast.show(
              $mdToast.simple()
                .textContent('Name is required!')
                .position("bottom right")
                .hideDelay(3000)
            ).then(function(response){
                $scope.play_text = "Play";
                $scope.play_disabled = false;
            });
        }
    });
    socket.on('play start',function(data){
        $scope.play_text = "Found";
    });
    socket.on('game over',function(data){
        $scope.play_text = "Play";
        $scope.play_disabled = false;
    });
    socket.on('game event',function(data){
        $scope.play_text = "On";
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
    });
}]);
