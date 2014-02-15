var CELL_W = 64;
var CELL_H = 64;
var COLLECTIBLE_SIZE = 32;

var stage;
var queue;

var background;
var interfaceBackground;
var clickedObject = null;
var highlight;

var gameWorld;
var map;
var inventory;
var player;
var populations = [];
var POPS_PER_SPEC = 5;
var nanobots = [];
var NANOBOTS_NUM = 5;


function init() {
    stage = new createjs.Stage("canvas");
    
    queue = new createjs.LoadQueue(false);
    queue.installPlugin(createjs.Sound);
    queue.addEventListener("complete", handleLoadComplete);
    queue.loadManifest([{id: "player_vehicle", src: "assets/player_vehicle.png"},
			{id: "nanobot", src: "assets/nanobot.png"},
			{id: "background", src: "assets/background.png"},
			{id: "star", src: "assets/star.png"},
			{id: "interface_background", src: "assets/interface_background.png"},
			{id: "highlight", src: "assets/highlight.png"},
			{id: "frog", src: "assets/frog.png"},
			{id: "fly", src: "assets/fly.png"}]
		      );
}

function handleLoadComplete(event) {
    // INIT INVENTORY
    // create container for the interface background bitmap
    inventory = new createjs.Container();
    inventory.y = 448;

    // create the interface background bitmap
    img = queue.getResult("interface_background");
    interfaceBackground = new createjs.Bitmap(img);
    inventory.addChild(interfaceBackground);

    // INIT GAMEWORLD & GAME OBJECTS
    // create the gameworld; 
    gameWorld = new createjs.Container();
    // create the gameworld background bitmap
    var img = queue.getResult("background");
    background = new createjs.Bitmap(img);
    background.name = "background";
    gameWorld.addChild(background);

    // init map
    map = new K.WorldMap(gameWorld.getBounds().height / CELL_H, gameWorld.getBounds().width / CELL_W,
    		       CELL_W, CELL_H);

    gameWorld.addChild(map);
    
    // init nanobots
    // var nanobotImg = queue.getResult("nanobot");    
    // var nanobotData = {
    // 	images: [nanobotImg],
    // 	frames: {width: 32, height: 32, count: 10, regX: 16, regY: 16},
    // 	animations: {
    // 	    rotate: {
    // 		frames: [0],
    // 		next: "rotate",
    // 		speed: 0.1
    // 	    }
    // 	}
    // };

    // var i;
    // for (i = 0; i < NANOBOTS_NUM; i++) {
    // 	var nanobot = new K.Rotor("nanobot", nanobotData, queue.getResult("highlight"), Math.ceil(Math.random() * 12) + 4);
    // 	nanobots.push(nanobot);
    // }
    // for (i = 0; i < nanobots.length; i++) {
    // 	gameWorld.addChild(nanobots[i]);
    // 	nanobots[i].x = Math.random() * gameWorld.getBounds().width;
    // 	nanobots[i].y = Math.random() * gameWorld.getBounds().height; 
    // }

    
    var frogImg = queue.getResult("frog");    
    var frogData = {
    	images: [frogImg],
    	frames: {width: 32, height: 32, regX: 16, regY: 16},
    	animations: {
    	    default: {
    		frames: [0],
    		next: "default",
    		speed: 0.1
    	    }
    	}
    };

    var flyImg = queue.getResult("fly");
    var flyData = {
	images: [flyImg],
	frames: {width: 32, height: 32, regX: 16, regY: 16},
    	animations: {
    	    default: {
    		frames: [0],
    		next: "default",
    		speed: 0.1
    	    }
    	}
    };
    
    
    for (var i = 0; i < POPS_PER_SPEC; i++) {
	var frog = new K.Population("frog", frogData, 100);
    	populations.push(frog);
	gameWorld.addChild(frog);

	var fly = new K.Population("fly", flyData, 100);
	populations.push(fly);
	gameWorld.addChild(fly);
    }
    for (i = 0; i < populations.length; i++) {
    	populations[i].x = Math.random() * gameWorld.getBounds().width;
    	populations[i].y = Math.random() * gameWorld.getBounds().height; 
    }
    

    // initialize highlight effect (when item clicked)
    highlight = new createjs.Bitmap(queue.getResult("highlight"));
    highlight.x = highlight.regX  = COLLECTIBLE_SIZE / 2;
    highlight.y = highlight.regY = COLLECTIBLE_SIZE / 2;
    
    // initialize player
    player = createPlayer();
    gameWorld.addChild(player);

    // add the gameworld and inventory container to the stage
    stage.addChild(gameWorld);
    stage.addChild(inventory);

    // HANDLE EVENTS
    // handle click events
    gameWorld.addEventListener("click", handleGameWorldClick);
    inventory.addEventListener("click", handleInventoryClick);

    // GAMELOOP
    // create game loop
    createjs.Ticker.addEventListener("tick", tick);
}

function handleGameWorldClick(event) {    
    var target = event.target;
    console.log(event.target.name);

    // CLICKED OBJECT AND ITS HIGHLIGHT
    if (target instanceof K.Population) {
	if (clickedObject !== target) {
	    // if there is already a clicked/highlighted object (that is, if clickObject != null)
	    if (clickedObject) {
		clickedObject.clicked = false;
		// highlight is allways in the background, ie, having an index == 0
		clickedObject.removeChildAt(0);
	    }	
	    target.clicked = true;
	    clickedObject = target;
	    clickedObject.addChildAt(highlight, 0);
	}
    } else {
	// if the player has clicked somewhere on the gameworld but not on the clickable object
	if (clickedObject) {
	    clickedObject.clicked = false;
	    clickedObject.removeChildAt(0);
	    clickedObject = null;
	}
    }

    // SET PLAYER MOVEMENT'S PARAMETERS
    var clickedGamewolrdPoint = gameWorld.globalToLocal(stage.mouseX, stage.mouseY);
    // set player translation target coordinates
    player.targetLocation.x = clickedGamewolrdPoint.x;
    player.targetLocation.y = clickedGamewolrdPoint.y;
    // set the target location angle    
    player.targetAngleRad = Math.atan2((player.targetLocation.y - player.y), (player.targetLocation.x - player.x));
    //  calculate the vx and vy component of the speed
    player.setTranslationVelocity();
    // and set the rotation speed and direction
    player.setRotationVelocity();
}

function handleInventoryClick(event) {    
    var target = event.target;
    if (target instanceof K.Population) {
	// remove the clicked item from the player inventory array
	var index = player.inv.indexOf(target);
	player.inv.splice(index, 1);

	// remove the item from the inventory 
	inventory.removeChild(target);
	// reposition items in inventory to account for the space generated by the item's removal
	for (var i = 0; i < player.inv.length; i++) {
	    player.inv[i].x = 32 + i * player.inv[i].w;
	}

	// position the clicked item in the gameworld
	target.x = player.x;
	target.y = player.y;

	// add the removed item just below the player object in the gameworld
	gameWorld.addChildAt(target, gameWorld.getChildIndex(player));
    }

}

function createPlayer() {
    // the function returns this variable
    var player;

    // create a player spritesheet
    var img = queue.getResult("player_vehicle");    
    var data = {
    	images: [img],
    	frames: {width: 64, height: 64, count: 10, regX: 32, regY: 32},
    	animations: {
	    fly: [0,3, "fly", 1.5]
	}
    };
    var spriteSheet = new createjs.SpriteSheet(data);

    // create a player object
    player = new createjs.Sprite(spriteSheet);

    // initialize easeljs library sprite object variables
    player.name = "player";
    player.x = stage.canvas.width / 2 - player.getBounds().width / 2;
    player.y = stage.canvas.height / 2 - player.getBounds().height / 2;
    player.rotation = 0;
    player.currentFrame = 0;
    player.gotoAndPlay("fly");

    // initialize custom variables needed for the game logic
    player.v = 4;
    player.vx = 0;
    player.vy = 0;
    player.av = 0;  // angular velocity
    player.inv = [];

    // the outer bounds used for the collision detection
    player.outerBounds = {};
    player.outerBounds.x = player.x;
    player.outerBounds.y = player.y;
    player.outerBounds.w = player.getBounds().width;
    player.outerBounds.h = player.getBounds().height;

    // the inner bounds used for the collision detection with the target location and gameworld objects
    player.innerBounds = {};
    player.innerBounds.x = player.x;
    player.innerBounds.y = player.y;
    // the minimal value of w and h is the maximal value of the velocity
    // otherwise, we would run the risk to "skip" the collision detection target
    player.innerBounds.w = player.v;
    player.innerBounds.h = player.v;

    // the x and y coordinates of the clicked point in the gameworld
    player.targetLocation = {};
    player.targetLocation.x = player.x;
    player.targetLocation.y = player.y;
    player.targetLocation.w = player.v;
    player.targetLocation.h = player.v;

    // the angle between the x axis and the straight line that connects the player position and the clicked point position
    player.targetAngleDeg = 0;
    player.targetAngleRad = 0;

    player.setRotationVelocity = function() {
	this.targetAngleDeg = this.targetAngleRad * (180 / Math.PI);
	if (this.rotation < this.targetAngleDeg) {
	    if (this.rotation < 0 && this.targetAngleDeg > 0) {
		if (Math.abs(this.rotation) + Math.abs(this.targetAngleDeg) > 180)
		    this.av = -8;
		else this.av = 8;
	    }
	    else this.av = 8;	
	}
	else if (this.rotation > this.targetAngleDeg) {
	    if (this.rotation > 0 && this.targetAngleDeg < 0) {
		if (Math.abs(this.rotation) + Math.abs(this.targetAngleDeg) > 180)
		    this.av = 8;
		else this.av = -8;
	    }
	    else this.av = -8;	
	}
    };

    player.setTranslationVelocity = function() {
	this.vy = Math.sin(this.targetAngleRad) * this.v;
	this.vx = Math.cos(this.targetAngleRad) * this.v;
    };

    player.rotate = function() {
	if (this.rotation > this.targetAngleDeg - Math.abs(this.av) && this.rotation < this.targetAngleDeg + Math.abs(this.av)) {
    	    this.av = 0;
	} else {
    	    this.rotation += this.av;
	    if (this.rotation > 180) {
		this.rotation -= 360;
	    } else 	if (this.rotation < -180) {
		this.rotation += 360;
	    }	    
	}	
    };

    player.translate = function() {
	if (testRectangle(player.innerBounds, player.targetLocation)) {
	    this.vx = this.vy = 0;
	} else {
	    this.x += this.vx;
	    this.y += this.vy;
	    this.innerBounds.x = this.outerBounds.x = this.x;
	    this.innerBounds.y = this.outerBounds.y = this.y;
	}
    };

    player.update = function() {
	this.rotate();
	this.translate();
    };
    
    return player;
}

/* GAME LOOP */
function tick(event) {
    player.update();

    // test for a collision only if the item is clicked
    if (clickedObject) {
	if (testRectangle(player.innerBounds, clickedObject) != NONE) {
	    if (clickedObject.clicked) {
		player.inv.push(clickedObject);
		gameWorld.removeChild(clickedObject);
		clickedObject.x = 32 + (player.inv.length - 1) * clickedObject.w;
		clickedObject.y = inventory.getBounds().height / 2;
		inventory.addChild(clickedObject);
		clickedObject.clicked = false;
		clickedObject.removeChildAt(0);
		clickedObject = null;
	    }
	}

    }    
    stage.update();
}

