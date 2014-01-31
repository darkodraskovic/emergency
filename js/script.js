var stage;
var gameWorld;
var queue;

var background;
var interfaceBackground;

var inventory;
var player;
var nanobot;

function init() {
    stage = new createjs.Stage("canvas");
    
    queue = new createjs.LoadQueue(false);
    queue.installPlugin(createjs.Sound);
    queue.addEventListener("complete", handleLoadComplete);
    queue.loadManifest([{id: "player_vehicle", src: "assets/player_vehicle.png"},
			{id: "nanobot", src: "assets/nanobot.png"},
			{id: "background", src: "assets/background.png"},
			{id: "interface_background", src: "assets/interface_background.png"}]
		      );
}

function handleLoadComplete(event) {
    console.log("Loaded!");

    gameWorld = new createjs.Container();
    // create gameworld background bitmap
    var img = queue.getResult("background");
    background = new createjs.Bitmap(img);
    gameWorld.addChild(background);

    // create interface background bitmap
    img = queue.getResult("interface_background");
    interfaceBackground = new createjs.Bitmap(img);
    interfaceBackground.y = 0;

    // init inventory
    inventory = new createjs.Container();
    inventory.y = 448;
    inventory.addChild(interfaceBackground);

    // init objs
    initNanobot();
    gameWorld.addChild(nanobot);
    // initialize player
    initPlayer();
    gameWorld.addChild(player);
    
    stage.addChild(gameWorld);
    stage.addChild(inventory);

    
    gameWorld.addEventListener("click", handleGameWorldClick);
    inventory.addEventListener("click", handleInventoryClick);

    createjs.Ticker.addEventListener("tick", tick);
}


function handleInventoryClick(event) {
    if (event.target === nanobot) {
	var index = player.inv.indexOf(event.target);
	player.inv.splice(index, 1);

	inventory.removeChild(event.target);
	event.target.x = player.x;
	event.target.y = player.y;
	event.target.clicked = false;
	gameWorld.addChildAt(event.target, gameWorld.getChildIndex(player));
    }

}

function handleGameWorldClick(event) {
    if (event.target === nanobot) {
	nanobot.clicked = true;
    } else {
	nanobot.clicked = false;
    }
	
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
    player.setBounds(-20,-20, 40, 40);

    player.inv = [];
}

function initNanobot() {
    var img = queue.getResult("nanobot");
    
    var data = {
    	images: [img],
    	frames: {width: 32, height: 32, count: 10, regX: 16, regY: 16},
    	animations: {
	    rotate: {
		frames: [0],
		next: "rotate",
		speed: 0.1
	    }
	}
    };

    var spriteSheet = new createjs.SpriteSheet(data);

    nanobot = new createjs.Sprite(spriteSheet);
    nanobot.gotoAndPlay("rotate");
    nanobot.name = "nanobot";
    nanobot.rotation = 0;
    nanobot.av = 8;
    nanobot.x = 128;
    nanobot.y = 128;
    nanobot.currentFrame = 0;
    nanobot.setBounds(-12, -12, 24, 24);
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

    if (nanobot.rotation > 360)
	nanobot.rotation -= 360;
    nanobot.rotation += nanobot.av;

    if (testRectangle(player, nanobot) != "none") {
	if (nanobot.clicked) {
	    player.inv.push(nanobot);
	    stage.removeChild(nanobot);
	    nanobot.x = 32 + (player.inv.length - 1) * 32;
	    nanobot.y = 32;
	    inventory.addChild(nanobot);
	    
	}
    }
    
    stage.update();
}
