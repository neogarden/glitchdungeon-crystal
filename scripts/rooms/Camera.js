function Camera(x, y){
	this.screen_offset_x = 0;
	this.screen_offset_y = 0;

	this.x = x || 0;
	this.y = y || 0; 
	this.view_scale = 4;
	this.width = GAME_WIDTH;
	this.height = GAME_HEIGHT;
	this.x_lim = 100;
	this.y_lim = 50;
	
	this.instant = true;
	this.speed = 1.5;
}

Camera.prototype.Render = function(ctx){
	//cover up non existant parts of the room (but that are still in render view
	ctx.fillStyle = "#000000";
	
	var width = room.GetWidth();
	if (this.width > width){		
		//left border
		ctx.fillRect(0, 0, -this.x, this.height);
		//right border
		ctx.fillRect((-this.x) + room.GetWidth(), 0, -this.x, this.height);
	}
	var height = room.GetHeight();
	if (this.height > height){		
		//top border
		ctx.fillRect(0, 0, this.width, -this.y);
		//bottom border
		ctx.fillRect(0, (-this.y) + room.GetHeight(), this.width, -this.y);
	}
}
		
Camera.prototype.Update = function(map){
	this.width = WINDOW_WIDTH / this.view_scale;
	this.height = WINDOW_HEIGHT / this.view_scale;
	
	//Horizontal panning RIGHT
	if (player.x + player.rb + this.x_lim - this.x >= this.width){
		if (this.x < map.MAP_WIDTH * Tile.WIDTH - this.width){
			if (this.instant)
				this.x = (player.x + player.rb + this.x_lim) - this.width;
			else{
				this.x += (this.speed);
			}
			
			if (this.x >= map.MAP_WIDTH * Tile.WIDTH - this.width)
				this.x = map.MAP_WIDTH * Tile.WIDTH - this.width;
		}
	} //HOrizontal panning LEFT
	if (player.x + player.lb - this.x_lim - this.x <= 0){
		if (this.x > 0){
			if (this.instant)
				this.x = (player.x + player.lb - this.x_lim);
			else{ 
				this.x -= (this.speed);
			}
			
			if (this.x <= 0) this.x = 0;
		}
	}
	//CORRECTION FOR TOO SMALL ROOM :)!
	var width = room.GetWidth();
	if (this.width > width){
		this.x = -(this.width - width) / 2;
	}
	
	//Vertical panning DOWN
	if (player.y + player.bb + this.y_lim - this.y >= this.height){
		if (this.y < map.MAP_HEIGHT * Tile.HEIGHT - this.height){
			if (this.instant)
				this.y = (player.y + player.bb + this.y_lim) - this.height;
			else{
				this.y += (this.speed);
			}
			
			if (this.y >= map.MAP_HEIGHT * Tile.HEIGHT - this.height)
				this.y = map.MAP_HEIGHT * Tile.HEIGHT - this.height;
		}
	} //vertical panning UPWARD
	if (player.y + player.tb - this.y_lim - this.y <= 0){
		if (this.y > 0){
			if (this.instant)
				this.y = (player.y + player.tb - this.y_lim);
			else{
				this.y -= (this.speed);
			}
			
			if (this.y <= 0) this.y = 0;
		}
	}
	//CORRECTION FOR TOO SMALL ROOM :)!
	var height = room.GetHeight();
	if (this.height > height){
		this.y = -(this.height - height) / 2;
	}
}