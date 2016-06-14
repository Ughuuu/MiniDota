app.controller('InGame', ['$scope', '$mdToast', function($scope, $mdToast) {
    var graphics;
    var renderer;
    var stage;
    var camera;
    var width = 1024;
    $scope.height = 524;
    var refwidth = 1024;
    var refheight = 524;
    var MAX_PLAYERS = 201;
    var START_X = 311;
    var START_Y = 470;
    var PLAYERS = [];
    var SHADOWS = [];
    var SHADOW_ON = true;
    var res;
    var chat_size = 100;
    $scope.actwidth = 1024;
    $scope.play_disabled = false;
    $scope.play_text = "Play";
    var heroes;
    $scope.play = function(){
        socket.emit('play request', true);
        $scope.play_disabled = true;
        $scope.play_text = "Find";
    };
    var animate = function () {
        renderer.render(stage);
        requestAnimationFrame(animate);
    };
    var doneload = function (loader, resources) {
        res = resources;
        var map = new PIXI.Sprite(res.map.texture);
        var mapfg = new PIXI.Sprite(res.mapfg.texture);
        map.scale.x = refheight/1120;
        map.scale.y = refheight/1120;
        map.position.x = refwidth/2-map.width/2+7;
        map.position.y = 48;
        mapfg.scale.x = refheight/524;
        mapfg.scale.y = refheight/524;
        camera.addChild(map);
        heroes = res.chibi.textures;
        for (var i = 0; i < MAX_PLAYERS; i++) {
            var player = new PIXI.Sprite(heroes["creep_dire"]);

            player.anchor.x = 0.5;
            player.anchor.y = 0.5;

            player.scale.x = 0.5;
            player.scale.y = 0.5;

            if(SHADOW_ON){
                var shadow = new PIXI.Sprite(heroes["creep_dire"]);
                shadow.anchor.x = 0.07;
                shadow.anchor.y = 0.8;

                shadow.scale.x = 0.5;
                shadow.scale.y = 1;
                shadow.rotation = 1;
                shadow.tint = 0x000000;
                shadow.alpha = 0.4;
                SHADOWS.push(shadow);
            }

            PLAYERS.push(player);
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

        width = window.innerWidth;
        $scope.height = width / 2;
        graphics = new PIXI.Graphics();
        renderer = new PIXI.autoDetectRenderer(width, $scope.height);
        renderer.backgroundColor = 0x283593;
        renderer.view.style.left = ((window.innerWidth - renderer.width) >> 1) + 'px';
        renderer.view.style.display = "block";
        renderer.autoResize = true;
        $('#canvas_holder').append(renderer.view);
        stage = new PIXI.Container();
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
        console.log(data);
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
        console.log("action");
        $scope.play_text = "Found";
    });
    socket.on('game over',function(data){
        console.log("action");
        $scope.play_text = "Play";
        $scope.play_disabled = false;
        alert(data);
    });
    socket.on('game event',function(data){
        $scope.play_text = "On";
        var n = data.length;
        if(PLAYERS.length < n){
            n = PLAYERS.length;
        }
        for(var i = 0 ; i < n; i++){
            PLAYERS[i].texture = heroes[data[i].name];
            PLAYERS[i].position.x = data[i].x + START_X;
            PLAYERS[i].position.y = -data[i].y + START_Y;
            PLAYERS[i].rotation = data[i].ang;

            if(SHADOW_ON){
                SHADOWS[i].texture = heroes[data[i].name];
                SHADOWS[i].position.x = data[i].x + START_X;
                SHADOWS[i].position.y = -data[i].y + START_Y;
                SHADOWS[i].rotation = data[i].ang + 1;
            }
        }
    });
}]);
