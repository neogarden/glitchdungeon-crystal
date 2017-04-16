class Glitch {
    public static GREY: number = 0;
    public static RED: number = 1;
    public static GREEN: number = 2;
    public static ZERO: number = 3;
    public static BLUE: number = 4;
    public static GOLD: number = 5;
    public static NEGATIVE: number = 6;
    public static PINK: number = 7;
    public static KID: number = 8;

    public static NEGATIVE_COLOR: number = 100;
    public static ERASE_SCREEN: number = 101;

    public static PREVIOUS: number = Glitch.GREY;
    public static glitch_types: string[] = [
        	"grey", "red", "green", "zero", "blue", "gold", "negative", "pink",
          "kid"
    ];

    public static GetGlitchTypes() : string[]{
        var glitch_types = [];
        for (var i = 0; i < Glitch.glitch_types.length; i++){
            glitch_types.push({name: Glitch.glitch_types[i], value: i});
        }
        return glitch_types;
    }

    public static TransformPlayer(map: Room, glitch_type: number, normalize = true,
        only_visual = false, transform_true_map = true){
    	var die_to_suffocation = false;
    	if (Glitch.PREVIOUS === Glitch.NEGATIVE){
    		die_to_suffocation = true;
    	}
    	Glitch.PREVIOUS = glitch_type;
    	if (glitch_type === Glitch.NEGATIVE){
    		die_to_suffocation = false;
    		player.stuck_in_wall = false;
    	}
    	if (room_manager) room_manager.glitch_type = glitch_type;

    	//Normalize the player before transforming
      var prev_tileset = map.tilesheet_name;
    	if (normalize){
    	    canvas.style.filter = "invert(0)";
    	    canvas.style.webkitFilter = "invert(0)";

    		var facing = player.facing;
    		var vel = player.vel;
    		var is_jumping = player.is_jumping;
    		var jump_timer = player.jump_timer;
    		var jump_time_limit = player.jump_time_limit;
    		var on_ground = player.on_ground;
    		var stuck_in_wall = player.stuck_in_wall;
    		var checkpoint_power = player.has_glitch_checkpoint;
            var inventory = player.inventory;
            var glitch = {type: player.glitch_type, index: player.glitch_index };
            var states = {num_deaths: player.num_deaths, spells_cast: player.spells_cast};
    		player = new Player(player.x, player.y);
            player.num_deaths = states.num_deaths;
            player.spells_cast = states.spells_cast;
            player.glitch_index = glitch.index;
            player.glitch_type = glitch.type;
            player.inventory = inventory;
    		player.die_to_suffocation = die_to_suffocation;
    		player.stuck_in_wall = stuck_in_wall;
    		player.facing = facing;
    		player.vel = vel;
    		player.is_jumping = is_jumping;
    		player.jump_timer = jump_timer;
    		player.jump_time_limit = 30;
    		player.on_ground = on_ground;
    		if (player.is_jumping)
    			player.grav_acc = player.float_grav_acc;
    		//player.grav_acc = grav_acc;
    		if (checkpoint_power !== undefined)
    			Glitch.PinkTransform();
    		player.has_glitch_checkpoint = checkpoint_power;

    		map.tilesheet_name = "tile_grey_sheet";
    	}

    	var oldbb = player.bb;
    	switch (glitch_type){
    		case Glitch.KID:
    			Glitch.KidTransform(map, only_visual);
    			break;
    		case Glitch.GREY:
    			Glitch.GreyTransform(map, only_visual);
    			break;
    		case Glitch.RED:
    			Glitch.RedTransform(map, only_visual);
    			break;
    		case Glitch.GREEN:
    			Glitch.GreenTransform(map, only_visual);
    			break;
    		case Glitch.BLUE:
    			Glitch.BlueTransform(map, only_visual);
    			break;
    		case Glitch.GOLD:
    			Glitch.GoldTransform(map, only_visual);
    			break;
    		case Glitch.ZERO:
    			Glitch.ZeroTransform(map, only_visual);
    			break;
    		case Glitch.NEGATIVE:
    			Glitch.NegativeTransform(map, only_visual);
    			break;
    		case Glitch.PINK:
    			Glitch.PinkTransform();
    			break;
    		case Glitch.NEGATIVE_COLOR:
    		    Glitch.NegativeColorTransform(map, only_visual);
    		    break;
    		case Glitch.ERASE_SCREEN:
    		    Glitch.EraseScreenTransform(map, only_visual);
    		    break;
    		default: break;
    	}
        player.tilesheet_name = map.tilesheet_name;
        if (!transform_true_map){
            map.tilesheet_name = prev_tileset;
        }

    	player.y += oldbb - player.bb;
    	player.image = eval("resource_manager." + player.img_name);
    }

    //******GLITCH TRANSFORMATION DEFINTIIONS***************************/
    public static KidTransform(map, only_visual){
    	player.img_name = "player_sheet";
    	if (only_visual) return;
    	map.tilesheet_name = "tile_grey_sheet";

    	player.max_run_vel = 1.2;
    	player.animation.frame_delay = 11;

    	player.jump_vel = 3.0;
    	//player.StartJump = function(){}
    	//player.Jump = function(){}
    }

    public static GreyTransform(map, only_visual){
    	player.img_name = "player_grey_sheet";
    	if (only_visual) return;
    	map.tilesheet_name = "tile_grey_sheet";
    }

    // see RedGlitch.ts
    public static RedTransform(map, only_visual) {};

    // see GreenGlitch.ts
    public static GreenTransform(map, only_visual) {};

    public static ZeroTransform(map, only_visual){
    	player.img_name = "player_zero_sheet";
    	if (only_visual) return;
    	map.tilesheet_name = "tile_zero_sheet";

    	player.DieToSpikesAndStuff = function(){}

    	/*player.Render = function(ctx, camera){
    		ctx.globalCompositeOperation = "lighter";
    		GameMover.prototype.Render.call(this, ctx, camera);
    		ctx.globalCompositeOperation = "source-over";
    	}*/
    }

    // See BlueGlitch.ts
    public static BlueTransform(map, only_visual) {};

    // see GoldGlitch.ts
    public static GoldTransform(map, only_visual) {};

    public static NegativeTransform(map, only_visual){
    	player.img_name = "player_negative_sheet";
    	if (only_visual) return;
    	map.tilesheet_name = "tile_negative_sheet";

    	player.HandleHorizontalCollisions = function(map, left_tile, right_tile, top_tile, bottom_tile, q, floor_tile){
    		this.horizontal_collision = false;
    		//Check all potentially colliding tiles
    		for (var i = top_tile; i <= bottom_tile; i++){
    			for (var j = left_tile; j <= right_tile; j++){
    				if (!map.isValidTile(i, j)) continue;
    				var tile = map.tiles[i][j];
    				//don't check for collisions if potential tile is "out of bounds" or not solid
    				if (tile.collision != Tile.SUPER_SOLID) continue;

    				//Reset floor tile
    				if (floor_tile == null || (tile.y > this.y && Math.abs(tile.x-this.x) < Math.abs(floor_tile.x-this.x))){
    					floor_tile = tile;
    				}

    				//Check for left collisions
    				if (this.vel.x < 0 && this.IsRectColliding(tile, this.x + this.lb + this.vel.x - 1,
    				this.y + this.tb + q, this.x + this.lb, this.y + this.bb - q)){
    					//this is a negative slope (don't collide left)
    					if (tile.l_height < tile.r_height){}
    					//okay we're colliding with a solid to our left
    					else{
    						this.vel.x = 0;
    						this.horizontal_collision = true;
    						this.x = tile.x + Tile.WIDTH - this.lb;
    					}
    				}

    				//Check for Right collisions
    				if (this.vel.x > 0 && this.IsRectColliding(tile, this.x + this.rb, this.y + this.tb + q, this.x + this.rb + this.vel.x + 1, this.y + this.bb - q)){
    					//this is a positive slope (don't collide right)
    					if (tile.r_height < tile.l_height){}
    					//okay we're colliding with a solid to our right
    					else{
    						this.vel.x = 0;
    						this.horizontal_collision = true;
    						this.x = tile.x - this.rb;
    					}
    				}
    			}
    		}
    	}

    	player.HandleVerticalCollisions = function(map, left_tile, right_tile, top_tile, bottom_tile, q){
    		//Check all potentially colliding tiles
    		for (var i = top_tile; i <= bottom_tile; i++){
    			for (var j = left_tile; j <= right_tile; j++){
    				if (!map.isValidTile(i, j)) continue;
    				var tile = map.tiles[i][j];
    				//don't check for collisions if potential tile is "out of bounds" or not solid
    				if (tile.collision == Tile.GHOST) continue;

    				//Check for top collisions
    				if (this.vel.y <= 0 && tile.collision === Tile.SUPER_SOLID && this.IsRectColliding(tile, this.x + this.lb + q, this.y + this.tb + this.vel.y - 1, this.x + this.rb - q, this.y + this.tb)){
    					this.vel.y = 0;
    					this.y = tile.y + Tile.HEIGHT - this.tb;
    				}

    				//Check for bottom collisions
    				if (this.vel.y >= 0 && this.IsRectColliding(tile, this.x + this.lb + q, this.y + this.bb, this.x + this.rb - q, this.y + this.bb + this.vel.y + 1)){
    					//Don't count bottom collision for fallthrough platforms if we're not at the top of it
    					if (tile.y < this.y + this.bb || (this.pressing_down && !this.touching_door && tile.collision != Tile.SUPER_SOLID))
    						continue;
    					this.vel.y = 0;

    					if (!this.played_land_sound){
    						Utils.playSound("land");
    						this.played_land_sound = true;
    					}
    					this.on_ground = true;
    					this.has_double_jumped = false;
    					this.y = tile.y - this.bb;
    				}
    			}
    		}
    	}

    	player.DieToSuffocation = function(map){};
    }

    public static PinkTransform(){
    	//player.img_name = "player_pink_sheet";
    	//if (only_visual) return;
    	//map.tilesheet_name = "tile_pink_sheet";

    	if (player.has_glitch_checkpoint === undefined)
    		player.has_glitch_checkpoint = false;

    	player.PressX = function(){
    		if (!this.touching_door && !this.touching_checkpoint){
    			if (!this.has_glitch_checkpoint){
    				room_manager.RemoveGlitchedCheckpoint();
    				room_manager.glitched_checkpoint = {
    					x: this.x, y: this.y,
    					room_x: room_manager.room_index_x,
    					room_y: room_manager.room_index_y,
    					facing: this.facing
    				};

    				var checkpoint = new Checkpoint(this.x, this.y);
    				checkpoint.lex = 3;
    				checkpoint.is_glitched = true;
    				room.entities.push(checkpoint);

    				this.has_glitch_checkpoint = true;
    			}else{
    				room.entities.push(new Residue(this.x, this.y, room_manager.glitched_checkpoint));

    				this.has_glitch_checkpoint = false;
    			}
    		}
    	}
    }

    public static NegativeColorTransform(map, only_visual){
        canvas.style.filter = "invert(1)";
        canvas.style.webkitFilter = "invert(1)";
    }

    public static EraseScreenTransform(map, only_visual){
        erase_screen = false;
    }
}
