/*==================
Waves for DemoEngine
==================*/
$(function(){


var x = 30;
var y = 0;


de.logic = function(){};
de.clear_canvas = false;
var x_increment = (de.width-20) / 20;
for(var i = 0; i < 20; i++){

	var wave = {
		x: x + i*x_increment ,
		y: 0 ,
		y_speed: Math.random() * (1.1 - .5) + .5 ,
		color: {
			red: 0,
			green: i * 10,
			blue: 100
		} ,
		oscillation: Math.random() * (.03 -.02) + .02 ,
		red_dir: true ,
		remove: false ,
		draw: function(canvas){
			
			this.y += this.y_speed;
			this.x = this.x + Math.sin(this.oscillation * this.y);
				
			this.color.red = Math.floor(255 * Math.sin(.03 * this.y));
			
			
			var color_string = "rgb(" + this.color.red + "," + this.color.green + "," + this.color.blue + ")";
			if(this.y > de.height){
				this.y = 0;
			}
			canvas.drawArc({
				fillStyle: color_string,
				x: this.x, 
				y: this.y,
				radius: 10
			});
		}
	}

	de.queue.push(wave);
	

	
	y++;
	
}




	

});