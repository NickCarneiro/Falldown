

/*==================
Rendering Engine
==================*/
//DemoEngine namespace
de = {
	//render queue processed on every iteration of render loop
	queue: [] ,
	//clear the canvas on every iteration
	clear_canvas: false ,
	init: function(canvas){
		
	} ,
	//called on every iteration
	logic: function(canvas){} ,
	width: $(window).width() ,
	height: $(window).height() ,
	keys: {
		left: false ,
		right: false ,
		space: false
	}
};

// shim layer with setTimeout fallback
window.requestAnimFrame = (function(){
return window.requestAnimationFrame || 
	window.webkitRequestAnimationFrame || 
	window.mozRequestAnimationFrame || 
	window.oRequestAnimationFrame || 
	window.msRequestAnimationFrame || 
	function( callback ){
		window.setTimeout(callback, 1000 / 60);
	};
})();

$(function(){
	//set canvas size
	var canvas = $("#canvas");
	$("#canvas").attr({width:de.width});
	$("#canvas").attr({height:de.height});

	//listen for keypresses
	$("body").on("keydown", function(e){
		if(e.which == 37)
			de.keys.left = true;
		else if(e.which == 39)
			de.keys.right = true;
		if(e.which == 32 || e.which == 38) // up / space do the same thing
			de.keys.space = true;
		if(e.which == 83)
			de.keys.s = true;
		if(e.which == 76)
			de.keys.l = true;
	});
	
	$("body").on("keyup", function(e){
		if(e.which == 37)
			de.keys.left = false;
		else if(e.which == 39)
			de.keys.right = false;
		if(e.which == 32 || e.which == 38)
			de.keys.space = false;
	});
	
	// Touch also acts as space ( to start game on mobile )
	$("body").on("touchstart", function(e) {
		de.keys.space = true;
	} );
	$("body").on("touchend", function(e) {
		de.keys.space = false;
	});
	
	// Accelerometer
	onDeviceMotion = function(e) {
		var x_accel;
		if( window.orientation == 0 || window.orientation == 180 )
			x_accel = e.accelerationIncludingGravity.x;
		else
			x_accel = e.accelerationIncludingGravity.y;
		if( window.orientation == 90 || window.orientation == 180 )
			x_accel *= -1;
			
		if( x_accel > 0.5 )
		{
			de.keys.right = true;
			de.keys.left = false;
		}
		else if( x_accel < -0.5 )
		{
			de.keys.left = true;
			de.keys.right = false;
		}
		else
		{
			de.keys.left = de.keys.right = false;
		}
	};
	window.addEventListener("devicemotion",onDeviceMotion,false);

	de.ignition = function(init, logic){
		de.init = init;
		de.logic = logic;
		de.init();
		de.render();
	}
	//this is the engine loop. It renders all entities in the queue.
	de.render = function(){
		//console.log(de.queue.length);
		if(de.clear_canvas === true){
			canvas.clearCanvas();
		}
		de.logic(canvas);
		//call every function in the render queue
		var new_queue = [];
		for(var i= 0; i < de.queue.length; i++){
			//if objects have been marked for removal, don't copy them to the new queue.
			//also don't draw them
			if(de.queue[i].remove != true){
				de.queue[i].draw(canvas);
				new_queue.push(de.queue[i]);
			}
			
		}

		de.queue = new_queue;
		
		//crank out as high of fps as we can
		requestAnimFrame( de.render );

	}
	de.init(canvas);

});