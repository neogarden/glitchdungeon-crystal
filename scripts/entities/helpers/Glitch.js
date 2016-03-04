Glitch.GREY = 0;
Glitch.RED = 1;
Glitch.GREEN = 2;
Glitch.ZERO = 3;
Glitch.BLUE = 4;
Glitch.GOLD = 5;
Glitch.NEGATIVE = 6;
Glitch.PINK = 7;
Glitch.KID = 8;

Glitch.NEGATIVE_COLOR = 100;
Glitch.ERASE_SCREEN = 101;

Glitch.PREVIOUS = 0;

function Glitch(){};

Glitch.TransformPlayer = function(map, glitch_type, normalize, only_visual, transform_true_map){
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
	normalize = defaultValue(normalize, true);
    transform_true_map = defaultValue(transform_true_map, true);
	only_visual = only_visual || false;

	//Normalize the player before transforming

    var prev_tileset = map.tilesheet_name;
	if (normalize){
	    erase_color = true;
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
		if (map.glitch_type != Glitch.RED){
			player.on_ground = false;
		}
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
			Glitch.PinkTransform(map, only_visual);
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
extend(GameSprite, Glitch);

//******GLITCH TRANSFORMATION DEFINTIIONS***************************/
Glitch.KidTransform = function(map, only_visual){
	player.img_name = "player_sheet";
	if (only_visual) return;
	map.tilesheet_name = "tile_grey_sheet";

	player.max_run_vel = 1.2;
	player.animation.frame_delay = 11;

	player.jump_vel = 3.0;
	//player.StartJump = function(){}
	//player.Jump = function(){}
}

Glitch.GreyTransform = function(map, only_visual){
	player.img_name = "player_grey_sheet";
	if (only_visual) return;
	map.tilesheet_name = "tile_grey_sheet";
}

Glitch.RedTransform = function(map, only_visual){
	player.img_name = "player_red_sheet";
	if (only_visual) return;
	map.tilesheet_name = "tile_red_sheet";

	player.HandleCollisionsAndMove = function(map){
		var left_tile = Math.floor((this.x + this.lb + this.vel.x) / Tile.WIDTH);
		var right_tile = Math.ceil((this.x + this.rb + this.vel.x) / Tile.WIDTH);
		var top_tile = Math.floor((this.y + this.tb + this.vel.y) / Tile.HEIGHT);
		var bottom_tile = Math.ceil((this.y + this.bb + this.vel.y) / Tile.HEIGHT);

		// Reset flag to search for ground collision.
		this.was_on_ground = this.on_ground;
		//this.on_ground = false;
		var q_horz = 3; //q is used to minimize height checked in horizontal collisions and etc.
		var q_vert = 3;
		var floor_tile = null;

		floor_tile = this.HandleHorizontalCollisions(map, left_tile, right_tile, top_tile, bottom_tile, q_horz, floor_tile);
		this.x += this.vel.x;
		this.HandleVerticalCollisions(map, left_tile, right_tile, top_tile, bottom_tile, q_vert);
		this.y += this.vel.y;
		if (this.vel.y != 0) this.played_land_sound = false;
	}
}

Glitch.GreenTransform = function(map, only_visual){
	player.img_name = "player_green_sheet";
	if (only_visual) return;
	map.tilesheet_name = "tile_green_sheet";

	player.gnd_run_acc = player.max_run_vel/5.0;
	player.gnd_run_dec = player.max_run_vel/15.0;
	player.air_run_acc = player.max_run_vel/20.0;
	player.air_run_dec = player.max_run_vel/30.0;

	player.terminal_vel = 1.0;
	player.original_grav_acc = 0.2;
	player.float_grav_acc = 0.025;
	player.grav_acc = player.original_grav_acc;
	player.jump_time_limit = 10;
	player.jump_vel = 2.0;
	player.has_double_jumped = false;
	player.has_triple_jumped = false;

	player.StartJump = function(){
		if (this.on_ground || !this.has_double_jumped || !this.has_triple_jumped){
			if (this.on_ground){
				this.has_triple_jumped = true;
			}
			Utils.playSound("jump");
			this.vel.y = -this.jump_vel;
			this.is_jumping = true;
			this.jump_timer = 0;
			if (!this.on_ground){
				this.vel.y *= 3;
				this.vel.y /= 4;
				if (this.has_double_jumped)
					this.has_triple_jumped = true;
				this.has_double_jumped = true;
				if (this.horizontal_input){

					var vel = this.max_run_vel;
					if (this.facing == Facing.LEFT && this.vel.x > -vel){
						this.vel.x = -vel;
					}
					if (this.facing == Facing.RIGHT && this.vel.x < vel){
						this.vel.x = vel;
					}
				}
			}
			this.on_ground = false;
		}
	}

	player.Move = function(mult){
		this.mult = mult;
		this.pressed_down = false;

		var acc;
		this.horizontal_input = true;
		//if ((this.vel.x * mult) < 0) this.vel.x = 0;
		if (this.on_ground){
			acc = this.gnd_run_acc;
			this.move_state = MoveState.RUNNING;
		}
		else{ acc = this.air_run_acc; }

		if (Math.abs(this.vel.x) < this.max_run_vel){
			this.vel.x += (acc * mult);
			this.CorrectVelocity(mult);
		}
		else if (Math.abs(this.vel.x) > this.max_run_vel){
			this.vel.x -= (acc * mult);
			if (Math.abs(this.vel.x) < this.max_run_vel)
				this.vel.x = this.max_run_vel * mult;
		}else if (Math.abs(this.vel.x) == this.max_run_vel && this.vel.x != this.max_run_vel * mult){
			this.vel.x += (acc * mult);
		}
	}
}

Glitch.ZeroTransform = function(map, only_visual){
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

Glitch.BlueTransform = function(map, only_visual){
	player.img_name = "player_blue_sheet";
	if (only_visual) return;
	map.tilesheet_name = "tile_blue_sheet";

	player.tb = 0;
	player.bb = 14;

	player.ApplyGravity = function(map)
	{
		if (!this.on_ground){
			if (this.vel.y > -this.terminal_vel)
			{
				this.vel.y -= (this.grav_acc);
				if (this.vel.y < -this.terminal_vel)
					this.vel.y = -this.terminal_vel;
			}else if (this.vel.y < -this.terminal_vel){
				this.vel.y += (this.grav_acc);
				if (this.vel.y > -this.terminal_vel)
					this.vel.y = -this.terminal_vel;
			}
		}else{ this.vel.y = 0; }
	}

	player.HandleVerticalCollisions = function(map, left_tile, right_tile, top_tile, bottom_tile, q){
		//Check all potentially colliding tiles
		for (var i = top_tile; i <= bottom_tile; i++){
			for (var j = left_tile; j <= right_tile; j++){
				if (!map.isValidTile(i, j)) continue;
				var tile = map.tiles[i][j];
				//don't check for collisions if potential tile is "out of bounds" or not solid
				if (tile.collision == Tile.GHOST || tile.collision == Tile.KILL_PLAYER) continue;

				var top_collision = false;
				var old_y = this.y;

				//Check for top collisions
				if (this.vel.y <= 0 && this.IsRectColliding(tile, this.x + this.lb + q, this.y + this.tb + this.vel.y-1, this.x + this.rb - q, this.y + this.tb)){
					//Don't count bottom collision for fallthrough platforms if we're not at the top of it
					if (tile.collision == Tile.FALLTHROUGH && (tile.y + Tile.HEIGHT > this.y || this.pressing_down))
						continue;

					this.vel.y = 0;
					this.y = tile.y + Tile.HEIGHT - this.tb;

					if (!this.played_land_sound){
						Utils.playSound("land");
						this.played_land_sound = true;
					}
					top_collision = true;
					this.on_ground = true;
					this.has_double_jumped = false;
				}

				//Check for bottom collisions
				if (this.vel.y > 0 && tile.collision != Tile.FALLTHROUGH && this.IsRectColliding(tile, this.x + this.lb + q, this.y + this.bb, this.x + this.rb - q, this.y + this.bb + this.vel.y + 1)){
					this.vel.y = 0;
					if (top_collision) this.y = old_y
					else this.y = tile.y - this.bb;
				}
			}
		}
	}


	player.StartJump = function(){
		if (this.on_ground){
			Utils.playSound("jump");
			this.vel.y = this.jump_vel;
			this.is_jumping = true;
			this.jump_timer = 0;
			this.on_ground = false;
		}
	}

	player.Jump = function(){
		if (this.is_jumping){
			this.jump_timer++;
			if (this.jump_timer >= this.jump_time_limit){
				this.jump_timer = 0;
				this.is_jumping = false;
				this.grav_acc = this.original_grav_acc;
			}else{
				this.grav_acc = this.float_grav_acc;
				this.vel.y += (this.jump_vel * ((this.jump_time_limit - (this.jump_timer/2)) / (this.jump_time_limit * 60)));
			}
		}
	}
}

Glitch.GoldTransform = function(map, only_visual){
	player.img_name = "player_gold_sheet";
	if (only_visual) return;
	map.tilesheet_name = "tile_gold_sheet";

	player.HandleCollisionsAndMove = function(map){
		var left_tile = Math.floor((this.x + this.lb + this.vel.x - 1) / Tile.WIDTH);
		var right_tile = Math.ceil((this.x + this.rb + this.vel.x + 1) / Tile.WIDTH);
		var top_tile = Math.floor((this.y + this.tb + this.vel.y - 1) / Tile.HEIGHT);
		var bottom_tile = Math.ceil((this.y + this.bb + this.vel.y + 1) / Tile.HEIGHT);

		// Reset flag to search for ground collision.
		this.was_on_ground = this.on_ground;
		this.on_ground = false;
		var q_horz = 3; //q is used to minimize height checked in horizontal collisions and etc.
		var q_vert = 3;
		var floor_tile = null;

		floor_tile = this.HandleHorizontalCollisions(map, left_tile, right_tile, top_tile, bottom_tile, q_horz, floor_tile);
		this.x += this.vel.x;
		if (this.horizontal_collision && this.horizontal_input){
			this.vel.y = -1;
			this.move_state = MoveState.RUNNING;
		}
		this.HandleVerticalCollisions(map, left_tile, right_tile, top_tile, bottom_tile, q_vert);
		this.y += this.vel.y;
		if (this.vel.y != 0) this.played_land_sound = false;
	}

	player.Update = function(map)
	{
		this.DieToSpikesAndStuff(map);
		this.DieToSuffocation(map);

		if (!this.stuck_in_wall){
			this.ApplyPhysics(map);
			this.prev_x = this.x;
			this.prev_y = this.y;
			if (!this.on_ground){
				if (!this.was_on_ground)
					this.pressed_down = false;
				if (!this.horizontal_collision){
					if (this.vel.y < 0) this.move_state = MoveState.JUMPING;
					else this.move_state = MoveState.FALLING;
				}else{
                    this.on_ground = true;
                }
			}
		}
		this.UpdateAnimationFromState();
		GameSprite.prototype.Update.call(this, map);

		this.touching_door = false;
		this.touching_checkpoint = false;
	}
}

Glitch.NegativeTransform = function(map, only_visual){
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

Glitch.PinkTransform = function(map, only_visual){
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

Glitch.NegativeColorTransform = function(map, only_visual){
    canvas.style.filter = "invert(1)";
    canvas.style.webkitFilter = "invert(1)";
}

Glitch.EraseScreenTransform = function(map, only_visual){
    erase_screen = false;
}
