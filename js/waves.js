/*
Waves for DemoEngine
*/
$(function(){
	

var x = 30;
var y = 0;
var red_dir = true
var color = 
	{
		red: 0,
		green: 100,
		blue: 100,
		
	};
	function drawArcs(){
		var x = 8 * Math.sin(y / 10);
		for(var i = 0; i < 20; i++){
			var arc = function(){
				x += 70;
				var color_string = "rgb(" + color.red + "," + color.green + "," + color.blue + ")";
				$("#canvas").drawArc({
					fillStyle: color_string,
					x: x, 
					y: y,
					radius: 10
				});
			}
			if(y < $(window).height()){
				queue.push(arc);
			} else {
				y = 0;
			}
			
		}
		if(red_dir === true){
			if(color.red < 255){
				color.red++;
				color.green++;
				color.blue++;
			} else {
				red_dir = false;
			}
		} else {
			if(color.red > 0){
				color.red--;
				color.green--;
				color.blue--;
			} else {
				red_dir = true;
			}
		}
		y++;
		setTimeout(drawArcs, 33);

	}

var queue = [];
	function render(){
		//call every function in the render queue
		var func = queue.pop()
		while(func != undefined){
			func();
			func = queue.pop();
		}
		setTimeout(render, 33);
	}

	drawArcs();
	render();
});