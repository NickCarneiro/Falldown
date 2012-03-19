$(function(){

	//initialize game engine state
	de.clear_canvas = true;
	var fd = {
		block_height: 15,
		//speed of the blocks moving up
		y_speed: 5 ,

		visible_rows: 0 ,
		max_rows: 10 ,
		//space between blocks
		gap_width: 100 ,
		//time the last row was sent up from the bottom
		last_time: 0 ,
		start_time: 0 ,
		//time between subsequent rows of blocks
		interval: 2000 ,
		//how fast the ball falls
		gravity: 5 ,
		ball_speed: 20 ,
		score: 0 ,
		//splash, playing, or over
		state: "splash"
	}
	//show splash message


	// logic function called on every iteration of game loop
	var logic = function(canvas){
		if(fd.state === "splash"){
			if(de.keys.space === true){

				startGame(canvas);
			}
		} else if(fd.state === "playing"){
			generateRow();
			doCollisions(canvas);

			//update score
			fd.score = (Date.now() - fd.start_time);

			//move blocks closer together
			if(fd.interval > 600){
				fd.interval = fd.interval - Math.floor(fd.score *0.0001);
			}
			//increase block speed as score increases
			//fd.y_speed += Math.floor(fd.score / 100000);

		} else if(fd.state === "over"){
			if(de.keys.space === true){
				startGame(canvas);
			}
		}
	};

	//called on page load
	var init = function(canvas){

		de.queue.push({
			draw: function(canvas){
				canvas.drawText({
					fillStyle: "#729fcf",
					strokeStyle: "#000",
					strokeWidth: 5,
					x: de.width / 2, y: de.height / 2,
					text: "Press space to play Falldown!",
					align: "center",
					baseline: "middle",
					font: "normal 36pt Verdana, sans-serif"
				});
			}
		});
	}

	function startGame(canvas){
		fd.score = 0;
		fd.start_time = Date.now();
		fd.state = "playing";
		de.queue = [];
		canvas.clearCanvas();
		fd.ball.x_pos = 100;
		fd.ball.y_pos = 100;
		de.queue.push(fd.ball);

		de.queue.push({
			draw: function(canvas){
				canvas.drawText({
					fillStyle: "#729fcf",
					strokeStyle: "#000",
					strokeWidth: 5,
					fromCenter: false ,
					x: 0, y: 0,
					text: "Score: " + fd.score,
					align: "left",
					baseline: "top",
					font: "normal 36pt Verdana, sans-serif"
				});
			}
		});
	}

	function endGame(canvas){
		fd.state = "over"
		//clear the queue
		de.queue = [];
		canvas.clearCanvas();

		//show game over message and print score
		de.queue.push({
			draw: function(canvas){
				canvas.drawText({
					fillStyle: "#729fcf",
					strokeStyle: "#000",
					strokeWidth: 5,
					x: de.width / 2, y: de.height / 2,
					text: "GAME OVER",
					align: "center",
					baseline: "middle",
					font: "normal 36pt Verdana, sans-serif"
				});
			}
		});

		de.queue.push({
			draw: function(canvas){
				canvas.drawText({
					fillStyle: "#729fcf",
					strokeStyle: "#000",
					strokeWidth: 5,
					x: de.width / 2, y: de.height / 2 + 100,
					text: "Score: " + fd.score,
					align: "center",
					baseline: "middle",
					font: "normal 36pt Verdana, sans-serif"
				});
			}
		});
		
	}

	function generateRow(){
		
		if(Date.now() -  fd.last_time < fd.interval){
			return;
		} 
		fd.last_time = Date.now();
		var segments = Math.floor(Math.random() * 4 + 2);
		//console.log("segments: " + segments);
		//generate block widths
		var segment_length = de.width / segments;
		for(var j = 0; j < segments; j++){
			var x = (segment_length + fd.gap_width) * j;
			var color = "#000";
			var block = {
				color: color ,
				x_pos:  x,
				y_pos: de.height - fd.block_height ,
				width: segment_length ,
				height: fd.block_height ,
				draw: function(canvas){
						//move up and draw
						this.y_pos -= fd.y_speed;
						//remove block when it goes off the top of the screen
						if(this.y_pos < 0){
							this.remove = true;
						}
						//console.log("width: " + this.width + " height: " + this.height + " x: " + this.x_pos + " y: " + this.y_pos);
						
						canvas.drawRect({
							fillStyle: this.color,
							x: this.x_pos, y: this.y_pos,
							width: this.width,
							height: this.height,
							fromCenter: false

						});
					}
			}
			de.queue.push(block);

		}

		fd.visible_rows++;

	}

	//responsible for all movement of the ball
	function doCollisions(canvas){

		//check if game has been lost
		if(fd.ball.y_pos < 0){
			console.log("Game over");
			endGame(canvas);
		}

		var block_collision = false;
		//do collision detection with rows
		for(var i = 0; i < de.queue.length; i++){
			if(fd.ball.collidesWith(de.queue[i])){
				de.queue[i].color = "#ff0000";
				block_collision = true;
			} else {
				de.queue[i].color = "#000";
			}
		}

		if(block_collision){
			//ball hit something, move up
			fd.ball.y_pos -= fd.y_speed;
		} else {
			//gravity pulls it down
			if(fd.ball.y_pos + fd.ball.height < de.height){
				fd.ball.y_pos += fd.gravity;
			} else if(fd.ball.y_pos > de.height - fd.ball.height){
				fd.ball.y_pos = de.height - fd.ball.height;
			}
			
		}

		//move the ball based on user input
		if(de.keys.left === true){
			if(fd.ball.x_pos > 0){
				fd.ball.x_pos -= fd.ball_speed;
			}
		} else if(de.keys.right === true){
			if(fd.ball.x_pos + fd.ball.width < de.width){
				fd.ball.x_pos += fd.ball_speed;
			}
		}

		//console.log(fd.ball.x_pos + " " + fd.ball.y_pos);
	}

	//add a ball
	fd.ball = {
		width: 50 ,
		height: 50 ,
		x_pos: 100 ,
		y_pos: 100 ,
		draw: function(canvas){
			canvas.drawEllipse({
				x: this.x_pos ,
				y: this.y_pos ,
				width: this.width ,
				height: this.height ,
				fromCenter: false ,
				fillStyle: "#000"
			});

		} ,
		//only the ball needs to check collisions against blocks. O(n) where n is # of blocks.
		//Can't imagine more than a few hundred blocks on screen
		collidesWith: function(block){
			// can't collide with self
			if(this === block){
				return false;
			}

			block.left = block.x_pos;
			block.right = block.x_pos + block.width;
			block.top = block.y_pos;
			block.bottom = block.y_pos + block.height;

			this.left = this.x_pos;
			this.right = this.x_pos + this.width;
			this.top = this.y_pos;
			this.bottom = this.y_pos + this.height;

			var ball = this;
			if(ball.left < block.right && ball.left > block.left || ball.right > block.left && ball.right < block.right){

				if(ball.bottom >= block.top && ball.bottom <= block.bottom ){
					return true;
				}
			}
			return false;
			/*
			return !( block.x_pos > this.x_pos + this.width
				|| block.x_pos + block.width < this.x_pos
				|| block.y_pos > this.y_pos + this.height
				|| block.y_pos + block.height  < this.y_pos
			);
		*/
			
		}
	}

	
	//ignition!
	de.ignition(init, logic);
	
	
});