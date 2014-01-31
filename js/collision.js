function findSceneryCollisionCandidates(sprite, map) {
    var collisionCandidates = [];    
    
    // var spriteCenterX = Math.floor(sprite.centerX() / map.tileW);
    // var spriteCenterY = Math.floor(sprite.centerY() / map.tileH);
    var spriteLeft = Math.floor(sprite.x / map.tileW);
    var spriteRight = Math.floor((sprite.x + sprite.w) / map.tileW);
    var spriteTop = Math.floor(sprite.y / map.tileH);
    var spriteBottom = Math.floor((sprite.y + sprite.h) / map.tileH);

    for (var i = 0; i < map.collisionLayers.length; i++) {
    	var collisionLayer = map.collisionLayers[i];

    	for (var cols = spriteLeft - 1; cols < spriteRight + 1; cols++) {
    	    for (var rows = spriteTop - 1; rows < spriteBottom + 1; rows++) {
    		if (collisionLayer[cols] && collisionLayer[cols][rows])
		    if (collisionLayer[cols][rows].exists)
    			collisionCandidates.push(collisionLayer[cols][rows]);
    	    }
    	}
    }

    return collisionCandidates;
}


function testCollisionMask(sprite1, sprite2) {
    if (!(sprite1.colMask & sprite2.colType)) {
	return false;
    } else return true;

}

// if block = true then add the blocking behavior
function testRectangle(r1, r2, block, bounce)
{

    block = block || false;
    bounce = bounce || false;

    
    //A variable to tell us which side the collision is occurring on
    var collisionSide = "";
    
    //Calculate the distance vector
    var vx = r1.centerX() - r2.centerX();
    var vy = r1.centerY() - r2.centerY();
    
    //Figure out the combined half-widths and half-heights
    var combinedHalfWidths = r1.halfWidth() + r2.halfWidth();
    var combinedHalfHeights = r1.halfHeight() + r2.halfHeight();
    
    //Check whether vx is less than the combined half-widths 
    if(Math.abs(vx) < combinedHalfWidths) 
    {
	//A collision might be occurring! 
	//Check whether vy is less than the combined half-heights 
	if(Math.abs(vy) < combinedHalfHeights)
	{
	    //A collision has occurred! This is good! 
	    //Find out the size of the overlap on both the X and Y axes
	    var overlapX = combinedHalfWidths - Math.abs(vx);
	    var overlapY = combinedHalfHeights - Math.abs(vy);
            
	    //The collision has occurred on the axis with the
	    //*smallest* amount of overlap. Let's figure out which
	    //axis that is
            
	    if(overlapX >= overlapY)
	    {
		//The collision is happening on the X axis 
		//But on which side? vy can tell us
		if(vy > 0)
		{
		    collisionSide = "top";
		    
		    //Move the rectangle out of the collision
		    if (block) r1.y = r1.y + overlapY;		    
		}
		else 
		{
		    collisionSide = "bottom";
		    
		    //Move the rectangle out of the collision
		    if (block) r1.y = r1.y - overlapY;
		}
		if (bounce) {
		    r1.vy = r1.vy * r1.bounce;
		}
	    } 
	    else 
	    {
		//The collision is happening on the Y axis 
		//But on which side? vx can tell us
		if(vx > 0)
		{
		    collisionSide = "left";
		    
		    //Move the rectangle out of the collision
		    if (block) r1.x = r1.x + overlapX;
		}
		else 
		{
		    collisionSide = "right";
		    
		    //Move the rectangle out of the collision
		    if (block) r1.x = r1.x - overlapX;
		}
		if (bounce) {
		    r1.vx = r1.vx * r1.bounce;		
		}
	    } 
	}
	else 
	{
	    //No collision
	    collisionSide = "none";
	}
    } 
    else 
    {
	//No collision
	collisionSide = "none";
    }
    
    return collisionSide;
}

