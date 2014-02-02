(function(window) {

    function Rotor(name, data, highlightImage, rotationVelocity) {
	this.initialize(name, data, highlightImage, rotationVelocity);
    }

    var p = Rotor.prototype = new createjs.Container();

    // private variables
    var sprite;
    var highlight;

    // public variables

    p.Container_initialize = p.initialize;

    p.initialize = function(name, data, highlightImage, rotationVelocity) {
	this.Container_initialize();

	var spriteSheet = new createjs.SpriteSheet(data);
	sprite = new createjs.Sprite(spriteSheet);
	sprite.name = name || "rotor";
	sprite.rotation = 0;
	sprite.currentFrame = 0;
	sprite.gotoAndPlay("rotate");

	sprite.w = sprite.getBounds().width;
	sprite.h = sprite.getBounds().height;
	sprite.rv = rotationVelocity; // rotational velocity

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

	this.on("tick", this.tick);

	
    };

    p.tick = function() {
	this.getChildAt(1).rotate();
    };

    window.Rotor = Rotor;

}(window));
