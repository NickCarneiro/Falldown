
/*==================
Script Loading UI
==================*/
$(function(){
	//populate script list on page load
	var scripts = [
		"squares" ,
		"waves"
	];

	$.each(scripts, function(i, script_name){
		$("#script_select").append('<option value="' + script_name + '.js">' + script_name + '</option>')
	})


	$("#change_script").on("click", function(){
		//reset application state for new demo
		window.clearTimeout();
		$("#dynamic_script").remove();
		$("#canvas").clearCanvas();
		de.clear_canvas = true;
		de.queue = [];
		de.logic = function(){};
		$("body").append('<script id="dynamic_script" src="js/' + $("#script_select").val() + '"></script>');
		de.render();

	});



});

/*==================
Rendering Engine
==================*/
//DemoEngine namespace
de = {
	//render queue processed on every iteration of render loop
	queue: [] ,
	//clear the canvas on every iteration
	clear_canvas: false ,
	//called on every iteration
	logic: function(){} ,
	width: $(window).width() ,
	height: $(window).height()
};


$(function(){
	
	//set canvas size
	var canvas = $("#canvas");
	$("#canvas").attr({width:de.width});
	$("#canvas").attr({height:de.height});

//this is the engine loop. It renders all entities in the queue.
	de.render = function(){
		//console.log(de.queue.length);
		if(de.clear_canvas === true){
			canvas.clearCanvas();
		}
		de.logic(canvas);
		//call every function in the render queue
		var new_queue = [];
		//canvas.clearCanvas();
		for(var i= 0; i < de.queue.length; i++){
			//if objects have been marked for removal, don't copy them to the new queue.
			//also don't draw them
			if(de.queue[i].remove != true){
				de.queue[i].draw(canvas);
				new_queue.push(de.queue[i]);
			}
			
		}

		de.queue = new_queue;


		//render at 60 fps
		setTimeout(de.render, 33);

	}

});