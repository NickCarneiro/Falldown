Clay.ready(function(){

	//initialize game engine state
	de.clear_canvas = true;
	var fd = {
		leaderboard: new Clay.Leaderboard( { id: 8 } ),
		block_height: 20, // set in startGame (based on screen height)
		//speed of the blocks moving up
		y_speed: 0 , // set in startGame (based on screen height)
		base_y_speed: 0, // same as y_speed when not slowed down
		normal_base_y_speed: 0, // to reset base_y_speed (we slow down if bad fps)
		clock_left: 0 , // how many rows left of slowmo
		row_timeout: false,
		visible_rows: 0 ,
		max_segments: 6,
		//space between blocks
		gap_width: 0 , // set in startGame (based on screen height)
		//time the last row was sent up from the bottom
		start_time: 0 ,
		// Last time logic was called (ms)
		prevTime: 0 ,
		//time between subsequent rows of blocks
		interval: 2000 ,
		//how fast the ball falls
		gravity: .005 ,
		max_y_speed: 0, // set in startGame (based on screen height)
		normal_max_y_speed: 0, // to reset max_y_speed (we slow down if bad fps)
		ball_speed: 0, // set in startGame (based on screen height)
		score: 0 ,
		//splash, playing, or over
		state: "splash",
		font_size: 36,
		font_color: "rgba( 255, 255, 255, 0.5 )",
		font_stroke: "rgba( 0, 0, 0, 0.5 )",
		font_stroke_width: "3",
		dt: 0 // for logging frame rate
	}
	//show splash message


	// logic function called on every iteration of game loop
	var logic = function(canvas){
		// Find out how long it's been since the last call (for movement)
		var cur_time = (new Date()).getTime()
		var dt = fd.dt = fd.prev_time == 0 ? 0 : cur_time - fd.prev_time;
		fd.prev_time = cur_time;
		
		// Counter bad framerates
		if( dt > 100 )
		{
			if( fd.max_y_speed > 0.1 )
				fd.max_y_speed -= 0.03;
			// Slow down the speed of blocks going up too
			if( fd.base_y_speed > 0.1 )
				fd.base_y_speed -= 0.03;
		}
		else if( dt < 80 )
		{
			// Reset to default vals
			fd.max_y_speed = fd.normal_max_y_speed;
			fd.base_y_speed = fd.normal_base_y_speed;
		}

		if(fd.state === "splash"){
			if(de.keys.space === true){
				de.keys.space = false; // so it doesn't try and jump immediately
				startGame(canvas);
			}
			if( de.keys.l === true )
			{
				de.keys.l = false;
				fd.leaderboard.show();
			}
			if( de.keys.s === true )
			{
				de.keys.s = false;
				setTimeout( function() { new Clay.Screenshot(); }, 1 ); // this is necessary for whatever reason
			}
		} else if(fd.state === "playing"){
			if( de.keys.l === true )
			{
				de.keys.l = false;
				fd.leaderboard.show();
			}
			if( de.keys.s === true )
			{
				de.keys.s = false;
				setTimeout( function() { new Clay.Screenshot(); }, 1 ); // this is necessary for whatever reason
			}

			doCollisions(canvas, dt);
			
			// Let's make blue random
			if(fd.ball.color.blue > 255){
				fd.ball.color_direction = false;	
			} else if(fd.ball.color.blue < 100){
				fd.ball.color_direction = true;
			}
			if(fd.ball.color_direction === true){
				fd.ball.color.blue += 2;
			} else {
				fd.ball.color.blue -= 2;
			}

			// More red closer to top
			fd.ball.color.red = Math.floor( ( ( de.height - fd.ball.y_pos ) / de.height ) * 255 );
			fd.ball.color.green = Math.floor( ( ( de.width - fd.ball.x_pos ) / de.width ) * 155 + 100 );
			
			// Dim the other colors a bit as it gets closer to top
			fd.ball.color.green = Math.floor( fd.ball.color.green * ( 1 - fd.ball.color.red / 255 ));
			fd.ball.color.blue = Math.floor( fd.ball.color.blue * ( 1 - fd.ball.color.red / 255 ));

			fd.ball.color_string = "rgb(" + fd.ball.color.red + "," + ( 255 - fd.ball.color.green ) + "," + ( 255 - fd.ball.color.blue ) + ")";

			// Change the canvas background color to be the opposite
			$("#canvas").css( 'background', "rgb(" + ( fd.ball.color.red ) + "," + ( fd.ball.color.green ) + "," + ( fd.ball.color.blue ) + ")" )

			//update score
			fd.score += dt;
			
			if( fd.max_segments > 2 + .0001 * dt )
				fd.max_segments -= .0001 * dt;
			
		} else if(fd.state === "over"){
			if(de.keys.space === true){
				de.keys.space = false; // so it doesn't try and jump immediately
				startGame(canvas);
			}
			if( de.keys.l === true )
			{
				de.keys.l = false;
				fd.leaderboard.show();
			}
			if( de.keys.s === true )
			{
				de.keys.s = false;
				setTimeout( function() { new Clay.Screenshot(); }, 1 ); // this is necessary for whatever reason
			}
		}
	};

	//called on page load
	var init = function(canvas){
		var width_ratio = de.width / 800;
		fd.font_size = 10 + 26 * width_ratio;
		fd.gap_width = 40 + 30 * width_ratio;
		fd.ball.width = fd.ball.height = 20 + 15 * width_ratio;
		fd.max_rows = de.height / 1.5 * fd.ball.height + fd.block_height;
		
		de.queue.push({
			draw: function(canvas){
				canvas.drawText({
					fillStyle: fd.font_color,
					strokeStyle: fd.font_stroke,
					strokeWidth: fd.font_stroke_width,
					x: de.width / 2, y: de.height / 2,
					text: "Press space to play Falldown!",
					align: "center",
					baseline: "middle",
					font: "normal " + fd.font_size + "px Verdana, sans-serif"
				});
			}
		});
		var text = ["Use arrow keys to move, don't let the ball hit the top!", "Collect stars for points and clocks to slow the game down", "Press [L] for leaderboard, [S] for screenshot!"];
		var offset = fd.font_size;
		for( var i in text )
		{
			de.queue.push({
				text: text[i],
				offset: offset,
				draw: function(canvas){
					canvas.drawText({
						fillStyle: fd.font_stroke,
						x: de.width / 2, y: de.height / 2 + this.offset,
						text: this.text,
						align: "center",
						baseline: "middle",
						font: "normal " + fd.font_size / 2 + "px Verdana, sans-serif"
					});
				}
			});
			offset += fd.font_size / 1.9;
		}
	}

	function startGame(canvas){
		fd.score = 0;
		fd.start_time = Date.now();
		// Reset some stuff
		fd.interval = 2000;
		// Set these based on the screen height
		var ratio = de.height / 600;
		fd.block_height = 15 * ratio;
		fd.y_speed = fd.base_y_speed = fd.normal_base_y_speed = .2 * ratio;
		fd.max_y_speed = fd.normal_max_y_speed = .3 * ratio;
		fd.ball_speed = 2 * de.width / (de.height / ( fd.interval / 10000 )); // it can move across the full width in half the time it takes a bar to travel all the way up
		fd.jump_speed = -.8 * ratio;
		fd.max_segments = Math.round( 6 * ratio );
		// Max segments still needs to be in a range of 3 to 6
		if( fd.max_segments < 3 )
			fd.max_segments = 3;
		else if( fd.max_segments > 6 )
			fd.max_segments = 6;

		fd.state = "playing";
		de.queue = [];
		canvas.clearCanvas();
		fd.ball.x_pos = 100;
		fd.ball.y_pos = 100;
		de.queue.push(fd.ball);
		
		generateRow(); // called over and over via timeout

		de.queue.push({
			draw: function(canvas){
				canvas.drawText({
					fillStyle: fd.font_color,
					strokeStyle: fd.font_stroke,
					strokeWidth: fd.font_stroke_width,
					fromCenter: false ,
					x: 0, y: 0,
					text: "Score: " + fd.score,
					align: "left",
					baseline: "top",
					font: "normal " + fd.font_size + "px Verdana, sans-serif"
				});
			}
		});
	}

	function endGame(canvas){
		fd.state = "over"
		clearTimeout(fd.row_timeout); // no more new rows!
		//clear the queue
		de.queue = [];
		canvas.clearCanvas();

		//show game over message and print score
		de.queue.push({
			draw: function(canvas){
				canvas.drawText({
					fillStyle: fd.font_color,
					strokeStyle: fd.font_stroke,
					strokeWidth: fd.font_stroke_width,
					x: de.width / 2, y: de.height / 2,
					text: "GAME OVER",
					align: "center",
					baseline: "middle",
					font: "normal " + fd.font_size + "px Verdana, sans-serif"
				});
			}
		});

		de.queue.push({
			draw: function(canvas){
				canvas.drawText({
					fillStyle: fd.font_color,
					strokeStyle: fd.font_stroke,
					strokeWidth: fd.font_stroke_width,
					x: de.width / 2, y: de.height / 2 + fd.font_size,
					text: "Score: " + fd.score,
					align: "center",
					baseline: "middle",
					font: "normal " + fd.font_size + "px Verdana, sans-serif"
				});
			}
		});
		
		de.queue.push({
			draw: function(canvas){
				canvas.drawText({
					fillStyle: fd.font_color,
					strokeStyle: fd.font_stroke,
					strokeWidth: fd.font_stroke_width,
					x: de.width / 2, y: de.height / 2 + fd.font_size * 2,
					text: "Press space to play again",
					align: "center",
					baseline: "middle",
					font: "normal " + fd.font_size / 3 + "px Verdana, sans-serif"
				});
			}
		});
		/*
		 * You're lame. If you're interested though, clay.io has optional
		 * backend encryption: http://clay.io/docs/encryption
		 */
		fd.leaderboard.post( { score: fd.score } );
		if( fd.score > 50000 )
			( new Clay.Achievement( { id: 19 } ) ).award();
		if( fd.score > 100000 )
			( new Clay.Achievement( { id: 20 } ) ).award();
		if( fd.score > 250000 )
			( new Clay.Achievement( { id: 21 } ) ).award();
		if( fd.score > 500000 )
			( new Clay.Achievement( { id: 22 } ) ).award();
		if( fd.score > 1000000 )
			( new Clay.Achievement( { id: 23 } ) ).award();
	}
	
	// Draw a star that can be picked up
	function generateStar( x, y )
	{
		var star = {
			x_pos: x,
			y_pos: y,
			width: fd.ball.height,
			height: fd.ball.height,
			height: fd.block_height ,
			star: true,
			draw: function(canvas) {
				canvas.drawPolygon({
					fillStyle: fd.font_color,
					strokeStyle: fd.font_stroke,
					strokeWidth: 1,
					x: this.x_pos, 
					y: this.y_pos,
					radius: this.width / 2,
					sides: 5,
					projection: -0.5
				});
			}
		}
		de.queue.push( star );
	}
	
	// They've collided with star, give points
	function grantStar( index )
	{
		de.queue[index].remove = true;
		// Give points
		fd.score += 1000;
		// Message that they got points
		showMessage( "+1000", de.queue[index].x_pos, de.queue[index].y_pos );
	}
	
	// Draw a clock that can be picked up
	function generateClock( x, y )
	{
		var clock = {
			x_pos: x,
			y_pos: y,
			width: fd.ball.height,
			height: fd.ball.height,
			clock: true,
			draw: function(canvas) {
				var src = $.browser.msie ? 'clock.png' : $( "#clock" )[0];
				canvas.drawImage({
					source: src,
					x: this.x_pos, 
					y: this.y_pos,
					width: this.width,
					height: this.height
				});
			}
		}
		de.queue.push( clock );
	}
	
	// They've collided with star, give points
	function grantClock( index )
	{
		de.queue[index].remove = true;
		// Message that they got points
		showMessage( "Slowwwww", de.queue[index].x_pos, de.queue[index].y_pos );
		// Slow down how fast blocks move up
		// Set back to normal after 3 rows
		fd.clock_left += 3;
	}
	
	function showMessage( msg, x, y )
	{
		// Don't do this if the frame rate sucks
		if( fd.dt > 70 )
			return;
		var msg_obj = {
			noCollide: true,
			opacity: 0.5,
			font_size: fd.font_size * 0.6,
			draw: function(canvas) {
					canvas.drawText({
					fillStyle: 'rgba( 255, 255, 255, ' + this.opacity + ' )',
					strokeStyle: 'rgba( 0, 0, 0, ' + this.opacity + ' )',
					strokeWidth: fd.font_stroke_width,
					fromCenter: false ,
					x: x,
					y: y - fd.font_size / 2,
					text: msg,
					align: "left",
					baseline: "top",
					font: "normal " + this.font_size + "px Verdana, sans-serif"
				});
			}
		}
		de.queue.push( msg_obj );
		// Get rid of it after 1s
		var text_interval = setInterval( function() {
			if( msg_obj.opacity > 0.005 )
			{
				msg_obj.opacity -= 0.005;
				msg_obj.font_size += 0.5;
			}
			else
			{
				msg_obj.remove = true;
				clearInterval( text_interval );
			}
		}, 10 );
	}

	function generateRow(){
		// Get rid of slowmo if need be
		if( fd.clock_left >= 1 )
		{
			// Make slow mo
			fd.y_speed = fd.base_y_speed / 2;
			// Return to normal speed
			if( fd.clock_left == 1 )
				fd.y_speed = fd.base_y_speed;
			fd.clock_left--;
		}

		new_interval = fd.interval - Math.floor(fd.score * 0.003 );
		var gap = fd.base_y_speed * new_interval - fd.block_height;

		if(fd.ball.height * 1.7 < gap ) // smallest gap is 1.7X ball size
			fd.interval = new_interval
		
		fd.row_timeout = setTimeout( generateRow, (fd.base_y_speed / fd.y_speed) * fd.interval );
		
		var segments = Math.floor(Math.random() * (Math.round(fd.max_segments) - 2) + 2);
		//console.log("segments: " + segments);
		//generate block widths
		var segment_length = ( de.width - fd.gap_width ) / (segments - 1);
		var offset_left = Math.random() * segment_length;
		for(var j = 0; j < segments; j++){
			var x = (segment_length + fd.gap_width) * j - offset_left;
			
			// See if we should toss on a star
			var rand = Math.random();
			if( rand < 0.3 )
				generateStar( x + ( rand * ( 1 / .3 ) * segment_length ), de.height - fd.block_height / 1.2 );
			else if( rand > 0.92 )
				generateClock( x + ( ( rand - .92 ) * ( 1 / .92 ) * segment_length ), de.height - fd.block_height / 1.2 );
		
			var color = "#000";
			var block = {
				color: color ,
				x_pos:	x,
				y_pos: de.height + fd.block_height ,
				width: segment_length ,
				height: fd.block_height ,
				draw: function(canvas){
						//remove block when it goes off the top of the screen
						if(this.y_pos < 0){
							this.remove = true;
						}
						
						canvas.drawRect({
							fillStyle: this.color,
							strokeStyle: fd.font_stroke,
							strokeWidth: 1,
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
	function doCollisions(canvas, dt){

		//check if game has been lost
		if(fd.ball.y_pos < 0){
			endGame(canvas);
		}

		var block_collision = [false, false, false]; // left, right, bottom
		//do collision detection with rows
		for(var i = 0; i < de.queue.length; i++){
			if(!de.queue[i].noCollide) // if a block/star
			{
				//move blocks up
				de.queue[i].y_pos -= fd.y_speed * dt;
				collision = fd.ball.collidesWith(de.queue[i], dt);
				if(collision[0] || collision[1] || collision[2]){
					if( de.queue[i].star ) // star
						grantStar( i );
					else if( de.queue[i].clock )
						grantClock( i );
					else // blocks
					{
						de.queue[i].color = "#ff0000";
						if(collision[0]) block_collision[0] = de.queue[i];
						if(collision[1]) block_collision[1] = de.queue[i];
						if(collision[2]) block_collision[2] = de.queue[i];
					}
				} 
				else
				{
					de.queue[i].color = "#000";
				}
			}
		}
		
		fd.ball.x_accel = 0; // reset

		//move the ball based on user input
		if(de.keys.left === true){
				fd.ball.x_accel = -fd.ball_speed / 75;
		} else if(de.keys.right === true){
				fd.ball.x_accel = fd.ball_speed / 75;
		}
		else
			fd.ball.x_vel = 0;

		// collision with left of block
		if(block_collision[0] || block_collision[1])
		{
			if(block_collision[0])
			{
				fd.ball.x_pos = block_collision[0].left - fd.ball.width;
				fd.ball.x_vel = 0;
			}
			// right
			if(block_collision[1])
			{
				fd.ball.x_pos = block_collision[1].right;
				fd.ball.x_vel = 0;
			}
		}
		// top of block
		else if(block_collision[2]){
			//ball hit something, move up
			fd.ball.y_pos = block_collision[2].top - fd.ball.height;
			fd.ball.y_vel = 0;
			fd.ball.on_ground = true;
		}
		
		if(!block_collision[2]) {
			//gravity pulls it down
			if(fd.ball.y_pos + fd.ball.height < de.height){
				fd.ball.on_ground = false;
				if(fd.ball.y_vel < fd.max_y_speed)
					fd.ball.y_vel += fd.gravity * dt; // acceleration
				else
					fd.ball.y_vel = fd.max_y_speed;
			} else if(fd.ball.y_pos > de.height - fd.ball.height){
				fd.ball.on_ground = true;
				fd.ball.y_pos = de.height - fd.ball.height;
				fd.ball.y_vel = 0;
			}
		}
		
		// jump if on a block
		if(de.keys.space === true && fd.ball.on_ground)
		{
			fd.ball.y_vel = fd.jump_speed;
		}
		
		var new_pos = fd.ball.x_pos + fd.ball.x_vel * dt;
		if( new_pos >= 0 && new_pos + fd.ball.width < de.width ) // Bounds check
			fd.ball.x_pos += fd.ball.x_vel * dt;
		else if( new_pos < 0 )
			fd.ball.x_pos = 0;
		else
			fd.ball.x_pos = de.width - fd.ball.width;
		// Double bounds check
		if( fd.ball.x_pos < 0 )
			fd.ball.x_pos = 0;
		else if( fd.ball.x_pos + fd.ball.width > de.width )
			fd.ball.x_pos = de.width - fd.ball.width;
		
		// Set the x vel based on acceleration
		var new_vel = fd.ball.x_vel + fd.ball.x_accel * dt;
		if( Math.abs( new_vel ) < fd.ball_speed ) // max speed
			fd.ball.x_vel += fd.ball.x_accel * dt;
		else if( new_vel > 0 )
			fd.ball.x_vel = fd.ball_speed;
		else
			fd.ball.x_vel = -fd.ball_speed;
		
		// Stuff to counter lower FPS
		// Make sure it doesn't go too far with bad framerate (or it will go through block)
		var dy = fd.ball.y_vel * dt;
		if( dy > fd.block_height )
			dy = fd.block_height / 10; // Move down very little

		fd.ball.y_pos += dy;
	}

	//add a ball
	fd.ball = {
		noCollide: true, // don't need to do collision between ball and ball...
		width: 50 ,
		height: 50 ,
		x_pos: 100 ,
		y_pos: 100 ,
		x_vel: 0 ,
		x_accel: 0,
		y_vel: 0 ,
		on_ground: false,
		color: { red: 0, green: 0, blue: 0 },
		color_string: "rgb(0,0,0)",
		color_direction: true, // true inc, false dec
		draw: function(canvas){
			canvas.drawEllipse({
				x: this.x_pos ,
				y: this.y_pos ,
				width: this.width ,
				height: this.height ,
				fromCenter: false ,
				fillStyle: this.color_string,
				strokeStyle: "#fff",
				strokeWidth: 3
			});

		} ,
		//only the ball needs to check collisions against blocks. O(n) where n is # of blocks.
		//Can't imagine more than a few hundred blocks on screen
		// returns array [left, right, below] (if it collides from that side)
		collidesWith: function(block, dt){
			// can't collide with self
			if(this === block){
				return [false, false, false];
			}
			
			var collide_left = false;
			var collide_right = false;
			var collide_bottom = false;

			block.left = block.x_pos;
			block.right = block.x_pos + block.width;
			block.top = block.y_pos;
			block.bottom = block.y_pos + block.height;

			this.left = this.x_pos;
			this.right = this.x_pos + this.width;
			this.top = this.y_pos;
			this.bottom = this.y_pos + this.height;

			var ball = this;
			
			// Move forward one step (so it doesn't fall through then move back up)
			ball.left += ball.x_vel * dt;
			ball.right += ball.x_vel * dt;
			
			if(ball.top < block.bottom && ball.bottom > block.top && ball.left < block.right && block.right - ball.left < ball.width) // left side of ball collides with of right side of block and by < ball.width
				collide_right = true;
			else if(ball.top < block.bottom && ball.bottom > block.top && ball.right > block.left && ball.right - block.left < ball.width) // right side of ball collides with left side of block
				collide_left = true;
			else if( ( ball.left < block.right && ball.left > block.left ) || ( ball.right > block.left && ball.right < block.right ) )
			{
				if(ball.bottom > block.top && ball.bottom < block.bottom + block.height / 2 ){
					collide_bottom = true;
				}
			}
			
			return [collide_left, collide_right, collide_bottom];			
		}
	}

	
	//ignition!
	de.ignition(init, logic);
	
	
});