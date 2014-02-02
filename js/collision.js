function testCollisionMask(sprite1, sprite2) {
    if (!(sprite1.colMask & sprite2.colType)) {
	return false;
    } else return true;

}

var NONE = 0;
var TOP = 1;
var BOTTOM = 2;
var LEFT = 3;
var RIGHT = 4;

function testRectangle(r1, r2, block, bounce)
{

    block = block || false;
    bounce = bounce || false;

    
    //A variable to tell us which side the collision is occurring on
    var collisionSide = NONE;
    
    //Calculate the distance vector
    var vx = r1.x - r2.x;
    var vy = r1.y - r2.y;
    
    //Figure out the combined half-widths and half-heights
    var combinedHalfWidths = r1.w / 2 + r2.w / 2;
    var combinedHalfHeights = r1.h / 2 + r2.h / 2;
    
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
		    collisionSide = TOP;
		    
		    //Move the rectangle out of the collision
		    if (block) r1.y = r1.y + overlapY;
		}
		else 
		{
		    collisionSide = BOTTOM;
		    
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
		    collisionSide = LEFT;
		    
		    //Move the rectangle out of the collision
		    if (block) r1.x = r1.x + overlapX;
		}
		else 
		{
		    collisionSide = RIGHT;
		    
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
	    collisionSide = NONE;
	}
    } 
    else 
    {
	//No collision
	collisionSide = NONE;
    }
    
    return collisionSide;
}

