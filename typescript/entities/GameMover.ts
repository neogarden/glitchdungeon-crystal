class MoveState{
    public static STANDING: number = 0;
    public static RUNNING: number = 1;
    public static JUMPING: number = 2;
    public static FALLING: number = 3;
}

class Facing{
    public static DOWN: number = 0;
    public static UP: number = 1;
    public static RIGHT: number = 2;
    public static LEFT: number = 3;
}

class Point{
    public x: number;
    public y: number;
    public z: number;

    public constructor(x: number, y: number, z: number = 0){
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

class GameMover extends GameSprite{
    public prev_x: number;
    public prev_y: number;
    public max_run_vel: number;
    public gnd_run_acc: number;
    public gnd_run_dec: number;
    public air_run_acc: number;
    public air_run_dec: number;
    public horizontal_input: boolean = false;
    public vertical_input: boolean = false;
    public mult: number = 0;

    public original_grav_acc: number = 0.8;
    public float_grav_acc: number = 0.4;
    public grav_acc: number = 0.8;
    public jump_vel: number;
    public terminal_vel: number;
    public jump_timer: number = 0;
    public jump_time_limit: number = 30;
    public jump_acc: number = 35.0;
    public previous_bottom: number;
    public is_jumping: boolean = false;
    public was_on_ground: boolean = true;
    public true_on_ground: boolean = true;
    public on_ground: boolean = true;
    public played_land_sound: boolean = true;

    public move_state: number = MoveState.STANDING;
    public prev_move_state: number = MoveState.STANDING;
    public facing: Facing = Facing.RIGHT;
    public original_facing: Facing = Facing.RIGHT;
    public die_to_suffocation: boolean = false;

    public left_flip_offset: number = 0;
    public horizontal_collision: boolean = false;
    public vertical_collision: boolean = false;
    public pressing_down: boolean = false;
    public pressed_down: boolean = false;
    public has_double_jumped: boolean = false;
    public has_triple_jumped: boolean = false;
    public stuck_in_wall: boolean = false;

    public vel: Point = new Point(0, 0);
    private prev_vel: Point = new Point(0, 0);

    public constructor(x, y, lb, tb, rb, bb, img_name,
                       max_run_vel = 1.5, jump_vel = 4.5, terminal_vel = 7.0){
    	super(x, y, lb, tb, rb, bb, img_name);
    	this.type = "GameMover";

    	this.prev_x = this.x;
    	this.prev_y = this.y;
    	this.max_run_vel = max_run_vel; //pixels/second
    	this.gnd_run_acc = this.max_run_vel/3.0;
    	this.gnd_run_dec = this.max_run_vel/3.0;
    	this.air_run_acc = this.max_run_vel/3.0;
    	this.air_run_dec = this.max_run_vel/3.0;

        this.jump_vel = jump_vel;
    	this.terminal_vel = terminal_vel;
    	this.previous_bottom = this.y + this.bb;
    }

    public Import(obj){
        super.Import(obj);
        this.max_run_vel = obj.max_run_vel;
    	this.jump_vel = obj.jump_vel;
    	this.terminal_vel = obj.terminal_vel;
    	this.facing = obj.facing || this.facing;
    }

    public Export(): any{
        var obj = super.Export.call(this);
    	obj.max_run_vel = this.max_run_vel;
    	obj.jump_vel = this.jump_vel;
    	obj.terminal_vel = this.terminal_vel;
    	return obj;
    }

    public ResetPosition(){
        super.ResetPosition();
        this.facing = this.original_facing;
    }

    public Update(map){
        this.DieToSuffocation(map);

    	if (!this.stuck_in_wall){
    		this.ApplyPhysics(map);
    		this.prev_x = this.x;
    		this.prev_y = this.y;
    		if (!this.on_ground){
    			if (!this.was_on_ground)
    				this.pressed_down = false;
    			if (this.vel.z < 0) this.move_state = MoveState.JUMPING;
    			else this.move_state = MoveState.FALLING;
    		}
    	}
    	this.UpdateAnimationFromState();
      this.prev_move_state = this.move_state;

      this.prev_vel.x = this.vel.x;
      this.prev_vel.y = this.vel.y;
      this.prev_vel.z = this.vel.z;
      super.Update(map);
    }

    /*********************PHYSICS AND COLLISION DETECTIONS********************/
    public DieToSuffocation(map){
    	this.die_to_suffocation = false;

    	var left_tile = Math.floor((this.x + this.lb) / Tile.WIDTH);
    	var right_tile = Math.floor((this.x + this.rb) / Tile.WIDTH);
    	var top_tile = Math.floor((this.y + this.tb) / Tile.HEIGHT);
    	var bottom_tile = Math.floor((this.y + this.bb) / Tile.HEIGHT);

    	//Check all potentially colliding tiles
    	var q = 3;
    	var dead = false;
    	var top_collision = false;
    	var bottom_collision = false;
    	var left_collision = false;
    	var right_collision = false;

    	for (var i = top_tile; i <= bottom_tile; i++){
    		for (var j = left_tile; j <= right_tile; j++){
    			if (!map.isValidTile(i, j)) continue;
    			var tile = map.tiles[i][j];
    			if (tile.collision !== Tile.SOLID || tile.collision !== Tile.SUPER_SOLID){
    				continue;
    			}

    			//left collisions
    			if (this.IsRectColliding(tile, this.x + this.lb,  this.y + this.tb + q, this.x + this.lb, this.y + this.bb - q)){
    				left_collision = true;
    				if (right_collision){
    					dead = true;
    					break;
    				}
    			}
    			//right collisions
    			if (this.IsRectColliding(tile, this.x + this.rb, this.y + this.tb + q, this.x + this.rb, this.y + this.bb - q)){
    				right_collision = true;
    				if (left_collision){
    					dead = true;
    					break;
    				}
    			}

    			//top collisions
    			if (tile.collision != Tile.FALLTHROUGH && this.IsRectColliding(tile, this.x + this.lb + q, this.y + this.tb, this.x + this.rb - q, this.y + this.tb)){
    				top_collision = true;
    				if (bottom_collision){
    					dead = true;
    					break;
    				}
    			}

    			//bottom collisions
    			if (this.IsRectColliding(tile, this.x + this.lb + q, this.y + this.bb, this.x + this.rb - q, this.y + this.bb)){
    				bottom_collision = true;
    				if (top_collision){
    					dead = true;
    					break;
    				}
    			}
    		}
    		if (dead) break;
    	}
    	//console.log("dead: " + dead + ", left: " + left_collision + ", right: " + right_collision + ", top: " + top_collision + ", bottom: " + bottom_collision);

    	if (dead){
    		this.stuck_in_wall = true;
    		//this.Die();
    	}else{
            this.stuck_in_wall = false;
        }
    }

    public Die(){}

    public ApplyPhysics(map){
      var prev_pos = {x: this.x, y: this.y};

    	this.ApplyGravity();

      if (!this.vertical_input) this.VerticalMoveStop();
    	if (!this.horizontal_input) this.HorizontalMoveStop();
    	this.HandleCollisionsAndMove(map);

    	if (this.x == prev_pos.x) this.vel.x = 0;
    	if (this.y == prev_pos.y) this.vel.y = 0;
    	this.previous_bottom = this.y + this.bb;
    }

    public ApplyGravity(){
      // TODO(jakeonaut): change to z, implement roc's feather
      // if (!this.on_ground){
    	// 	if (this.vel.y < this.terminal_vel)
    	// 	{
    	// 		this.vel.y += (this.grav_acc);
    	// 		if (this.vel.y > this.terminal_vel)
    	// 			this.vel.y = this.terminal_vel;
    	// 	}else if (this.vel.y > this.terminal_vel){
    	// 		this.vel.y -= (this.grav_acc);
    	// 		if (this.vel.y < this.terminal_vel)
    	// 			this.vel.y = this.terminal_vel;
    	// 	}
    	// }else{ this.vel.y = 0; }
    }

    public HandleCollisionsAndMove(map){
      var left_tile = Math.floor((this.x + this.lb + this.vel.x - 1) / Tile.WIDTH);
    	var right_tile = Math.ceil((this.x + this.rb + this.vel.x + 1) / Tile.WIDTH);
    	var top_tile = Math.floor((this.y + this.tb + this.vel.y - 1) / Tile.HEIGHT);
    	var bottom_tile = Math.ceil((this.y + this.bb + this.vel.y + 1) / Tile.HEIGHT);

    	// Reset flag to search for ground collision.
      // TODO(jaketrower): implement this for roc's feather
    	// this.was_on_ground = this.on_ground;
    	// this.on_ground = false;
    	// this.true_on_ground = false;
    	var q_horz = 2; //q is used to minimize height checked in horizontal collisions and etc.
    	var q_vert = 2;

        var tiles = [];
        for (var i = top_tile; i <= bottom_tile; i++){
            for (var j = left_tile; j <= right_tile; j++){
                if (!map.isValidTile(i, j))
                    continue;
                if (map.tiles[i][j].collision == Tile.GHOST ||
                    map.tiles[i][j].collision == Tile.KILL_PLAYER)
                    continue;
                tiles.push(map.tiles[i][j]);
            }
        }

    	this.HandleHorizontalCollisions(tiles, map.entities, q_horz);
      if (this.vertical_input && this.vel.y != 0) {
        this.x += this.vel.x * 0.75;
      } else this.x += this.vel.x;
    	this.HandleVerticalCollisions(tiles, map.entities, q_vert);
      if (this.horizontal_input && this.vel.x != 0) {
        this.y += this.vel.y * 0.75;
    	} else this.y += this.vel.y;
    }

    private PlayLandSound(vel_key: string) {
      if (this.prev_vel[vel_key] != 0) Utils.playSound("land");
    }

    public HandleLeftCollision(object, q){
        if (this.vel.x < 0 && this.IsRectColliding(object,
            this.x + this.lb + this.vel.x - 1,
            this.y + this.tb + q,
            this.x + this.lb,
            this.y + this.bb - q)){

                this.PlayLandSound('x');
                this.vel.x = 0;
                this.horizontal_collision = true;
                this.x = object.x + object.rb - this.lb;
        }
    }

    public HandleRightCollision(object, q){
        if (this.vel.x > 0 && this.IsRectColliding(object,
            this.x + this.rb,
            this.y + this.tb + q,
            this.x + this.rb + this.vel.x + 2,
            this.y + this.bb - q)){

                this.PlayLandSound('x');
                this.vel.x = 0;
                this.horizontal_collision = true;
                this.x = object.x - this.rb;
        }
    }

    public HandleHorizontalCollisions(tiles, entities, q){
    	this.horizontal_collision = false;

    	//Check all potentially colliding tiles
    	for (var i = 0; i < tiles.length; i++){
    		var tile = tiles[i];
    		//don't check for collisions if potential tile is not solid
    		if (tile.collision != Tile.SOLID &&
                tile.collision != Tile.SUPER_SOLID)
                continue;

    		this.HandleLeftCollision(tile, q);
        this.HandleRightCollision(tile, q);
    	}

        for (i = 0; i < entities.length; i++){
            if (!entities[i].solid) continue;
            if (entities[i] === this) continue;

            this.HandleLeftCollision(entities[i], q);
            this.HandleRightCollision(entities[i], q);
        }
    }

    public HandleTopCollision(object, q) {
        if (this.vel.y < 0 && this.IsRectColliding(object,
            this.x + this.lb + q,
            this.y + this.tb + this.vel.y-1,
            this.x + this.rb - q,
            this.y + this.tb)){

                this.PlayLandSound('y');
                this.vel.y = 0;
                this.y = object.y + object.bb - this.tb;
        }
    }

    public HandleBottomCollision(object, q){
        //Check for bottom collisions
        if (this.vel.y >= 0 && this.IsRectColliding(object,
            this.x + this.lb + q,
            this.y + this.bb,
            this.x + this.rb - q,
            this.y + this.bb + this.vel.y + 2)){

                this.PlayLandSound('y');
                this.vel.y = 0;
                this.y = object.y - this.bb;
        }
    }

    public HandleVerticalCollisions(tiles, entities, q){
    	//Check all potentially colliding tiles
    	for (var i = 0; i < tiles.length; i++){
    		var tile = tiles[i];

    		//Check for top collisions
            if (tile.collision != Tile.FALLTHROUGH)
                this.HandleTopCollision(tile, q);

            //Don't count bottom collision for fallthrough platforms if we're not at the top of it
            if (tile.collision == Tile.FALLTHROUGH &&
                (tile.y < this.y + this.bb || this.pressing_down))
                    continue;
            this.HandleBottomCollision(tile, q);
    	}

        for (i = 0; i < entities.length; i++){
            if (!entities[i].solid) continue;
            if (entities[i] === this) continue;

            this.HandleTopCollision(entities[i], q);
            this.HandleBottomCollision(entities[i], q);
        }
    }

    /******************RENDER AND ANIMATION FUNCTIONS***********************/
    public UpdateAnimationFromState(){
      let ani_y = 0; // let Facing.DOWN be default ani_y = 0;
      if (this.facing == Facing.UP) ani_y = 1;
      if (this.facing == Facing.RIGHT) ani_y = 2;
      if (this.facing == Facing.LEFT) ani_y = 3;

    	switch (this.move_state){
    		case MoveState.STANDING:
    			this.animation.Change(0, ani_y, 1);
    			break;
    		case MoveState.RUNNING:
          this.animation.Change(0, ani_y, 2);
          if (this.prev_move_state == MoveState.STANDING) {
            this.animation.curr_frame += 1;
          }
          if (this.vel.x == 0 && this.vel.y == 0) {
            this.animation.frame_delay = 16;
          } else {
            this.animation.frame_delay = 8;
          }
    			break;
    		default: break;
    	}
    }

    /*******************FUNCTIONS FOR MOVEMENT INPUT BY OBJECT*****************/
    public MoveLeft() {
    	this.facing = Facing.LEFT;
    	this.HorizontalMove(-1);
    }

    public MoveRight() {
    	this.facing = Facing.RIGHT;
    	this.HorizontalMove(1);
    }

    public MoveUp() {
      this.facing = Facing.UP;
      this.VerticalMove(-1);
    }

    public MoveDown() {
      this.facing = Facing.DOWN;
      this.VerticalMove(1);
    }

    public HorizontalMove(mult) {
      this.horizontal_input = true;
      this.Move(mult, 'x');
    }

    public VerticalMove(mult) {
      this.vertical_input = true;
      this.Move(mult, 'y');
    }

    public Move(mult: number, vel_key: string){
      this.pressed_down = false;

      // pivot snap turn opposite directions
      if ((this.vel[vel_key] * mult) < 0) this.vel[vel_key] = 0;

      var acc;
      if (this.on_ground){
      	acc = this.gnd_run_acc;
      	this.move_state = MoveState.RUNNING;
      }
      else { acc = this.air_run_acc; }

      var max_run_vel = this.max_run_vel;
      if (Math.abs(this.vel[vel_key]) < max_run_vel){
      	this.vel[vel_key] += (acc * mult);
      	this.CorrectVelocity(mult, vel_key);
      }
      else if (Math.abs(this.vel[vel_key]) > max_run_vel){
      	this.vel[vel_key] -= (acc * mult);
      	if (Math.abs(this.vel[vel_key]) < max_run_vel) {
      		this.vel.x = max_run_vel * mult;
        }
      }
      else if (Math.abs(this.vel[vel_key]) == max_run_vel
                && this.vel[vel_key] != max_run_vel * mult){
    		this.vel[vel_key] += (acc * mult);
      }
    }

    public HorizontalMoveStop(){
      this.MoveStop('x');
    }

    public VerticalMoveStop() {
      this.MoveStop('y');
    }

    private MoveStop(vel_key: string) {
      let run_dec = this.gnd_run_dec;
      if (!this.on_ground) run_dec = this.air_run_dec;

  		if (this.vel[vel_key] > 0) {
  			this.vel[vel_key] -= (this.gnd_run_dec);
  			if (this.vel[vel_key] < 0) this.vel[vel_key] = 0;
  		} else if (this.vel[vel_key] < 0) {
  			this.vel[vel_key] += (this.gnd_run_dec);
  			if (this.vel[vel_key] > 0) this.vel[vel_key] = 0;
  		}

      if (this.on_ground && !this.vertical_input && !this.horizontal_input) {
        this.move_state = MoveState.STANDING;
      }
    }

    public CorrectVelocity(mult: number, vel_key: string) {
      if (Math.abs(this.vel[vel_key]) > this.max_run_vel) {
        this.vel[vel_key] = this.max_run_vel * mult;
      }
    }

    public StartJump(){
    	if (this.on_ground){
    		Utils.playSound("jump");
    		this.vel.y = -this.jump_vel;
    		this.is_jumping = true;
    		this.jump_timer = 0;
    		this.on_ground = false;
    	}
    }

    public Jump(){
    	if (this.is_jumping){
    		this.jump_timer++;
    		if (this.jump_timer >= this.jump_time_limit){
    			this.jump_timer = 0;
    			this.is_jumping = false;
    			this.grav_acc = this.original_grav_acc;
    		}else{
    			this.grav_acc = this.float_grav_acc;
          // TODO(jaketrower): change to z (roc's feather)
    			// this.vel.y += (-this.jump_vel * ((this.jump_time_limit - (this.jump_timer/2)) / (this.jump_time_limit * 60)));
    		}
    	}
    }

    public StopJump(){
    	this.is_jumping = false;
    	this.grav_acc = this.original_grav_acc;
    }
}
