
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
		//reset application state
		$("#dynamic_script").remove();
		$("#canvas").clearCanvas();
		queue = [];
		art.logic = function(){};
		$("body").append('<script id="dynamic_script" src="js/' + $("#script_select").val() + '"></script>');
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
	clear: false ,
	//called on every iteration
	logic: function(){}
};


$(function(){
	
	//set canvas size
	var canvas = $("#canvas");
	$("#canvas").attr({width:$(window).width()});
	$("#canvas").attr({height:$(window).height()});

//this is the engine loop. It renders all entities in the queue.
	function render(){
		if(de.clear === true){
			canvas.clearCanvas();
		}
		de.logic();
		//call every function in the render queue
		var new_queue = [];
		//canvas.clearCanvas();
		for(var i= 0; i < queue.length; i++){
			queue[i].draw(canvas);

			//if objects have been marked for removal, don't copy them to the new queue.
			if(queue[i].remove !== true){
				new_queue.push(queue[i]);
			}
			
		}

		queue = new_queue;


		//render at 60 fps
		setTimeout(render, 33);

	}

	render();
});