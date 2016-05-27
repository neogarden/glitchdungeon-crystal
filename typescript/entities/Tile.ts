class Slope{
    public static FLAT: number = 0;
    public static LOW_POS: number = (Math.PI / 6);
    public static MID_POS: number = (Math.PI / 4);
    public static HI_POS: number = (Math.PI / 3);
    public static LOW_NEG: number = -(Math.PI / 6);
    public static MID_NEG: number = -(Math.PI / 4);
    public static HI_NEG: number = -(Math.PI / 3);
}

class Tile extends GameObject{
    public static NORMAL_DISPLAY: number = 0;
    public static COLLISION_DISPLAY: number = 1;
    public static DISPLAY_TYPE: number = Tile.NORMAL_DISPLAY;

    public static WIDTH = 8;
    public static HEIGHT = 8;

    public static GHOST = -1;
    public static SOLID = 0;
    public static FALLTHROUGH = 1;
    public static KILL_PLAYER = 2;
    public static SUPER_SOLID = 3;

    public collision: number;
    public slope: number;
    public tileset_x: number = 0;
    public tileset_y: number = 0;

    public l_height: number;
    public r_height: number;

    public constructor(x, y, collision = Tile.GHOST, slope = Slope.FLAT){
    	super(x, y, 0, 0, Tile.WIDTH, Tile.HEIGHT);
    	this.type = "Tile";
    	this.collision = collision
    	if (collision == Tile.KILL_PLAYER)
            this.kill_player = true;

    	this.SetLRHeights();
    }

    public Import(obj){
        this.collision = obj.collision;
    	this.slope = obj.slope;
    	this.SetLRHeights();

    	this.tileset_x = obj.tileset_x;
    	this.tileset_y = obj.tileset_y;
    }

    public Export(): any{
        return {
            collision: this.collision,
            slope: this.slope,
            tileset_x: this.tileset_x,
            tileset_y: this.tileset_y
        };
    }

    public SetLRHeights(){
        //default to flat
    	switch (this.slope){
    		case Slope.LOW_POS: case Slope.MID_POS: case Slope.HI_POS:
    			this.l_height = Tile.HEIGHT;
    			this.r_height = Tile.HEIGHT - (Math.tan(this.slope) * Tile.WIDTH);
    			break;
    		case Slope.LOW_NEG: case Slope.MID_NEG: case Slope.HI_NEG:
    			this.l_height = Tile.HEIGHT - (Math.tan(this.slope) * Tile.WIDTH);
    			this.r_height = Tile.HEIGHT;
    			break;
    		case Slope.FLAT:
    			this.l_height = 0;
    			this.r_height = 0;
    		default: break;
    	}
    }

    public RenderFromImage(ctx, camera, image){
        if ((image === null || (this.tileset_x == 0 && this.tileset_y == 0))
    		&& Tile.DISPLAY_TYPE !== Tile.COLLISION_DISPLAY)
    			return;
    	var row = this.tileset_y;
    	var column = this.tileset_x;

    	if (Tile.DISPLAY_TYPE === Tile.NORMAL_DISPLAY){
    		ctx.drawImage(image,
    			//SOURCE RECTANGLE
    			Tile.WIDTH * column, Tile.HEIGHT * row, Tile.WIDTH, Tile.HEIGHT,
    			//DESTINATION RECTANGLE
    			~~(this.x-camera.x+camera.screen_offset_x+0.5),
    			~~(this.y-camera.y+camera.screen_offset_y+0.5),
    			Tile.WIDTH, Tile.HEIGHT
    		);
    	}else if (Tile.DISPLAY_TYPE === Tile.COLLISION_DISPLAY){
    		switch (this.collision){
    			case Tile.GHOST:
    				ctx.fillStyle = "#000000";
    				break;
    			default: case Tile.SOLID:
    				ctx.fillStyle = "#aaaaaa";
    				break;
    			case Tile.FALLTHROUGH:
    				ctx.fillStyle = "#00ffff";
    				break;
    			case Tile.KILL_PLAYER:
    				ctx.fillStyle = "#ff0000";
    				break;
    			case Tile.SUPER_SOLID:
    				ctx.fillStyle = "#ffffff";
    				break;
    		}
    		ctx.fillRect(~~(this.x-camera.x + camera.screen_offset_x + 0.5),
    					 ~~(this.y-camera.y + camera.screen_offset_y + 0.5),
    					 Tile.WIDTH, Tile.HEIGHT);
    	}
    }
}
