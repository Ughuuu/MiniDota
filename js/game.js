app.controller('InGame', ['$scope', function($scope) {
    $scope.graphics;
    $scope.renderer;
    $scope.stage;
    $scope.camera;
    $scope.width = 1024;
    $scope.height = 524;
    $scope.refwidth = 1024;
    $scope.actwidth = 1024;
    $scope.refheight = 524;
    $scope.MAX_PLAYERS = 500;
    $scope.PLAYERS = [];
    $scope.play_disabled = 0;
    $scope.play = function(){
        socket.emit('play request', 1);
    }
    $scope.animate = function () {
        $scope.renderer.render($scope.stage);
        requestAnimationFrame($scope.animate);
    }
    $scope.doneload = function (loader, resources) {
        var map = new PIXI.Sprite(resources.map.texture);
        var mapfg = new PIXI.Sprite(resources.mapfg.texture);
        var mapbg = new PIXI.Sprite(resources.mapbg.texture);
        map.scale.x = $scope.refheight/1120;
        map.scale.y = $scope.refheight/1120;
        map.position.x = $scope.refwidth/2-map.width/2+7;
        map.position.y = 48;
        mapfg.scale.x = $scope.refheight/524;
        mapfg.scale.y = $scope.refheight/524;
        mapbg.scale.x = $scope.refheight/524;
        mapbg.scale.y = $scope.refheight/524;
        //$scope.camera.addChild(mapbg);
        $scope.camera.addChild(map);
        $scope.camera.addChild(mapfg);
        for (var i = 0; i < $scope.MAX_PLAYERS; i++) {
            var player = new PIXI.Sprite(resources.holder.texture);

            player.anchor.x = 0.5;
            player.anchor.y = 0.5;

            player.scale.x = 0.1;
            player.scale.y = 0.1;

            $scope.PLAYERS.push(player);

            //$scope.camera.addChild(player);
        }

        for(var i = 0; i< $scope.PLAYERS.length; i++){
            $scope.PLAYERS[i].position.x = Math.random()*1000;
            $scope.PLAYERS[i].position.y = Math.random()*1000;        
        }

        // kick off the animation loop (defined below)
        $scope.animate();
    }
    $scope.startload = function(){
        // 04b03
        PIXI.loader.add('minidota', 'res/minidota.png')
                   .add('jugg', 'res/jugg.png')
                   .add('holder', 'res/holder.png')
                   .add('map', 'res/map.png')
                   .add('mapbg', 'res/mapbg.png')
                   .add('mapfg', 'res/mapfg.png')
                   .add('mini', 'res/mini.png')
                   //.add('font', 'res/04B_03__.fnt')
        .load($scope.doneload);
    }
    $scope.init = function () {
        $scope.width = window.innerWidth;
        $scope.height = $scope.width / 2;
        $scope.graphics = new PIXI.Graphics();
        $scope.renderer = new PIXI.autoDetectRenderer($scope.width, $scope.height);
        $scope.renderer.backgroundColor = 0x283593;
        $scope.renderer.view.style.left = ((window.innerWidth - $scope.renderer.width) >> 1) + 'px';
        $scope.renderer.view.style.display = "block";
        $scope.renderer.autoResize = true;
        $('#canvas_holder').append($scope.renderer.view);
        $scope.stage = new PIXI.Container();
        $scope.camera = new PIXI.Container();
        // init camera to center, it shouldn't ever move
        $scope.camera.scale.x = 1;
        $scope.camera.scale.y = 1;
        $scope.camera.position.x = 0;
        $scope.camera.position.y = 0;
        
        $scope.stage.addChild($scope.camera);
        $scope.startload();
        $scope.resize();
        window.onresize = $scope.resize;
    };
    $scope.resize = function (event){
        $scope.actwidth = window.innerWidth;
        $scope.width = Math.min(window.innerWidth, (window.innerHeight-200)*2);
        $scope.height = $scope.width / 2;

        $scope.renderer.view.style.width = $scope.width + "px";
        $scope.renderer.view.style.height = $scope.height + "px";
        $scope.camera.scale.x = $scope.width/1024;
        $scope.camera.scale.y = $scope.width/1024;

        $scope.renderer.resize($scope.width,$scope.height);
    };
    $scope.init();
    $scope.play = function(){

    };
}]);

function rgbToHex(r, g, b) {
    return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
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