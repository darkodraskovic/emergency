var stage;
var queue;

var background;
var interfaceBackground;
var player;

function init() {
    stage = new createjs.Stage("canvas");
    
    queue = new createjs.LoadQueue(false);
    queue.installPlugin(createjs.Sound);
    queue.addEventListener("complete", handleLoadComplete);
    queue.loadManifest([{id: "player_vehicle", src: "assets/player_vehicle.png"},
			{id: "background", src: "assets/background.png"},
			{id: "interface_background", src: "assets/interface_background.png"}]
		      );
}

function handleLoadComplete(event) {
    console.log("Loaded!");

    // create gameworld background bitmap
    var img = queue.getResult("background");
    background = new createjs.Bitmap(img);

    // create interface background bitmap
    img = queue.getResult("interface_background");
    interfaceBackground = new createjs.Bitmap(img);
    interfaceBackground.y = 448;

    // initialize player
    initPlayer();
    
    stage.addChild(background);
    stage.addChild(player);
    stage.addChild(interfaceBackground);
    
    background.addEventListener("click", handleClick);

    createjs.Ticker.addEventListener("tick", tick);
}

function tick(event) {
    input();

    if (player.rotation > angleDeg - Math.abs(player.av) && player.rotation < angleDeg + Math.abs(player.av)) {
    	player.av = 0;
    } else {
    	player.rotation += player.av;
	if (player.rotation > 180) {
	    player.rotation -= 360;
	} else 	if (player.rotation < -180) {
	    player.rotation += 360;
	}	    
    }
	
    var pt = player.globalToLocal(player.targetX, player.targetY);
    if (player.hitTest(pt.x, pt.y)) {
	player.vx = player.vy = 0;
    } else {
	player.x += player.vx;
	player.y += player.vy;	
    }

    stage.update();
}

function handleClick(event) {
    player.targetX = stage.mouseX;
    player.targetY = stage.mouseY;
    player.vy = Math.sin(angleRad) * player.v;
    player.vx = Math.cos(angleRad) * player.v;
    
    angleDeg = angleRad * (180 / Math.PI);

    if (player.rotation < angleDeg) {
	if (player.rotation < 0 && angleDeg > 0) {
	    if (Math.abs(player.rotation) + Math.abs(angleDeg) > 180)
		player.av = -8;
	    else player.av = 8;
	}
	else player.av = 8;	
    }
    else if (player.rotation > angleDeg) {
	if (player.rotation > 0 && angleDeg < 0) {
	    if (Math.abs(player.rotation) + Math.abs(angleDeg) > 180)
		player.av = 8;
	    else player.av = -8;
	}
	else player.av = -8;	
    }

}

var angleRad;
var angleDeg = 0;
function input() {
    angleRad = Math.atan2((stage.mouseY - player.y), (stage.mouseX - player.x));
}

function initPlayer() {
    var img = queue.getResult("player_vehicle");
    
    var data = {
    	images: [img],
    	frames: {width: 64, height: 64, count: 10, regX: 32, regY: 32},
    	animations: {
	    fly: [0,3, "fly", 1.5]
	}
    };

    var spriteSheet = new createjs.SpriteSheet(data);

    player = new createjs.Sprite(spriteSheet);
    player.gotoAndPlay("fly");
    player.name = "player";
    player.rotation = 0;
    player.v = 4;
    player.vx = 0;
    player.vy = 0;
    player.av = 0;
    player.x = stage.canvas.width / 2 - 32;
    player.y = stage.canvas.height / 2 -32;
    player.targetX = player.x;
    player.targetY = player.y;
    player.currentFrame = 0;


}
