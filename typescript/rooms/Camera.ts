class Camera{
    public x: number;
    public y: number;
    public screen_offset_x: number = 0;
    public screen_offset_y: number = 0;

    public view_scale: number = 4;
    public width: number = GAME_WIDTH;
    public height: number = GAME_HEIGHT;
    public x_lim: number = 100;
    public y_lim: number = 50;

    public instant: boolean = true;
    public speed: number = 1.5;

    public constructor(x = 0, y = 0){
    	this.x = x;
    	this.y = y;
    }

    public Render(ctx){
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

    public Update(map){
    	this.width = GAME_WIDTH / this.view_scale;
    	this.height = GAME_HEIGHT / this.view_scale;

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
}
