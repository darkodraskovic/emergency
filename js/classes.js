var K = {};

(function(){
    var WorldMap = function(rows, cols, cellW, cellH) {
	this.initialize(rows, cols, cellW, cellH);
    };

    var p = WorldMap.prototype = new createjs.Container();

    p.Container_initialize = p.initialize;

    p.initialize = function(rows, cols, cellW, cellH) {
	this.Container_initialize();
	this.rows = rows;
	this.cols = cols;

	for (var i = 0; i < this.rows; i++) {
	    for (var j = 0; j < this.cols; j++) {
		var cell = new createjs.Container();
		cell.name = "x:" + j + ",y:" + i;
		cell.w = cellW;
		cell.h = cellH;
		// the map matrix position of the cell
		cell.col = j;
		cell.row = i;
		// the pixel position of the cell (in the map)
		// cell.regX = cell.w / 2;
		// cell.regY = cell.h / 2;
		cell.x = cell.col * cellW;
		cell.y = cell.row * cellH;

		// shape used for the collision detection with the container (for testing purposes only)
		// var hit = new createjs.Shape();
		// hit.graphics.beginFill("#000").drawRect(0, 0, cellW, cellH);
		// cell.hitArea = hit;

		this.addChild(cell);
	    }
	}
    };

    K.WorldMap = WorldMap;
}());

(function(){
    function Thing(data, name) {
	this.initialize(data, name);
    }

    var p = Thing.prototype = new createjs.Sprite();

    // static properties

    // public properties

    // constructor
    p.Sprite_initialize = p.initialize; // avoid overriding base class

    p.initialize = function(data, name) {
	var spriteSheet = new createjs.SpriteSheet(data);
	this.Sprite_initialize(spriteSheet);

	this.name = name || "thing";
    };

    K.Thing = Thing;
    
}());


(function(){
    var Population = function(name, data, qty, predator, prey) {
	this.initialize(name, data, qty, predator, prey);
    };

    var p = Population.prototype = new createjs.Container();

    p.Container_initialize = p.initialize;

    p.initialize = function(name, data, qty, predator, prey) {
	this.Container_initialize();
	this.name = name;

	// add the sprite to the container
	var spriteSheet = new createjs.SpriteSheet(data);
	var sprite = new createjs.Sprite(spriteSheet);
	sprite.x = data.frames.width / 2;
	sprite.y = data.frames.height / 2;
	sprite.currentFrame = 0;
	sprite.gotoAndPlay("default");

	this.addChild(sprite);
	// shape used for the collision detection with the container 
	var hit = new createjs.Shape();
	hit.graphics.beginFill("#000").drawRect(0, 0, data.frames.width, data.frames.height);
	this.hitArea = hit;
	// transform the center into origin
	this.w = data.frames.width;
	this.h = data.frames.height;
	this.regX = data.frames.regX;
	this.regY = data.frames.regY;
	
	this.qty = qty || 100;

	// set later when all the species are defined
	// predator and prey refere to classes
	this.predator = predator || null;
	this.prey = prey || null;
	this.neighbor = null;
	// this.qty -= this.predator.aggr * this.predator.qty * (event.delta / resistance);
	// if resistance === 1000, the population will be lessened by this.predator.aggr * this.predator.qty
	this.resistance = 0;
	this.aggr = 0;

    };

    p.survive = function(predator, delta) {
	this.qty -= predator.aggr * predator.qty * (delta / this.resistance);
    };
    
    K.Population = Population;
    
}());


(function() {
    var Rotor = function(name, data, highlightImage, rotationVelocity) {
	this.initialize(name, data, highlightImage, rotationVelocity);
    };

    var p = Rotor.prototype = new createjs.Container();

    // private variables
    var sprite;
    var highlight;

    // public variables

    p.Container_initialize = p.initialize;

    p.initialize = function(name, data, highlightImage, rotationVelocity) {
	this.Container_initialize();
	this.name = name || "rotor";
	
	var spriteSheet = new createjs.SpriteSheet(data);
	sprite = new createjs.Sprite(spriteSheet);
	sprite.rotation = 0;
	sprite.currentFrame = 0;
	sprite.gotoAndPlay("rotate");

	sprite.w = sprite.getBounds().width;
	sprite.h = sprite.getBounds().height;
	sprite.rv = rotationVelocity; // rotational velocity
	sprite.name = "sprite";

	sprite.rotate = function() {
	    if (this.rotation > 360)
		this.rotation -= 360;
	    this.rotation += this.rv;
	};

	highlight = new createjs.Bitmap(highlightImage);
	highlight.visible = false;
	highlight.name = "highlight";

	this.addChild(highlight);
	this.addChild(sprite);
	sprite.x = sprite.getBounds().width / 2;
	sprite.y = sprite.getBounds().height / 2;

	this.regX = this.getBounds().width / 2;
	this.regY = this.getBounds().height / 2;

	this.w = this.getBounds().width;
	this.h = this.getBounds().height;
	
	var hit = new createjs.Shape();
	hit.graphics.beginFill("#000").drawRect(0, 0, this.w, this.h);
	this.hitArea = hit;
	
	this.on("tick", this.tick);
	
    };

    p.tick = function() {
	this.getChildAt(1).rotate();
    };

    K.Rotor = Rotor;

}());


