(function(window){

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

    window.Thing = Thing;
    
}(window));
