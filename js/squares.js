/*==================
Squares for DemoEngine
==================*/

$(function(){
	//initialize squares in render queue
	var window_height = $(window).height();
	var window_width = $(window).width();
	var square_count = 100;
	var rotation = -20;
	var direction = true;
	var origin_x = window_height / 2;
	var origin_y = window_height / 2;
	var origin_x_speed = 5;
	var origin_y_speed = 5;
	var color_direction = true;
	var color = 
		{
			red: Math.floor(Math.random() * 255),
			green: Math.floor(Math.random() * (255 - 200) + 200),
			blue: Math.floor(Math.random() * 255)

		};

	//overwrite logic function to add squares when we fall below the threshold.
	de.logic = function(){
		if(de.queue.length < square_count){
			de.queue.push(createSquare());
		}
	}

	de.clear_canvas = true;

	function createSquare(){
		if(origin_x > window_width / 2 + 400){
			origin_x_speed = origin_x_speed * -1;
		} else if(origin_x < window_width / 2 - 400){
			origin_x_speed = origin_x_speed * -1;
		}

		if(origin_y > window_height /2 + 400){
			origin_y_speed = origin_y_speed * -1;
		} else if(origin_y < window_height / 2 - 400){
			origin_y_speed = origin_y_speed * -1;
		}

		origin_x += origin_x_speed;
		origin_y += origin_y_speed;
			rotation += 0.5;
	

		if(rotation > 30){
			rotation = -30;
			
		}

		if(color.red > 254){
			color_direction = false;	
		} else if(color.red < 1){
			color_direction = true;
		}
		if(color_direction === true){
			color.red += 5;
		} else {
			color.red -= 5;
		}
		
		color.green = 10 * Math.floor(Math.sin(3* color.red));
		color.blue = 100;
		var color_string = "rgb(" + color.red + "," + color.green + "," + color.blue + ")";
		var x_speed = Math.sin(rotation);
		var y_speed = (rotation < 20 && rotation > 0 ) ? rotation + 10 : (rotation < 0 && rotation > -20 ) ? rotation + 10 : rotation;
		var square = {
			width: 30,
			height: 30,
			x_speed: x_speed,
			y_speed: y_speed,
			x_pos: origin_x,
			y_pos: origin_y,
			color: color_string,
			remove: false ,
			toString: function() {
				return this.objectId;
			},
			draw: function(canvas){
				this.x_pos = this.x_pos  + this.x_speed;
				this.y_pos = this.y_pos  + this.y_speed;
				canvas.drawRect({
					fillStyle: this.color,
					x: this.x_pos, y: this.y_pos,
					width: this.width,
					height: this.height,
					fromCenter: true
				});

				if(this.y_pos > window_height || this.x_pos < 0){
					this.remove = true;
				} else if(this.y_pos > window_width || this.y_pos < 0){
					this.remove = true;
				}


			}
		}
		return square;
	}

	function populateSquares(){
		for(var i = 0; i < square_count; i++){
			de.queue.push(createSquare());
		}
	}

	populateSquares();
	
	
});