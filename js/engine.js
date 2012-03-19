

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


$(function(){
	//set canvas size
	var canvas = $("#canvas");
	$("#canvas").attr({width:de.width});
	$("#canvas").attr({height:de.height});

	//listen for keypresses
	$("body").on("keydown", function(e){
		if(e.which == 37){
			de.keys.left = true;
		} else if(e.which == 39){
			de.keys.right = true;
		} else if(e.which == 32){
			de.keys.space = true;
		}
	});

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

		//clear keys
		
		$.each(de.keys, function(i, key){
			de.keys[i] = false;
		});
		
		//render at 60 fps
		setTimeout(de.render, 33);

	}

	de.init(canvas);

});