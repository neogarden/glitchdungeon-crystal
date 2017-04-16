var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var MoveState = (function () {
    function MoveState() {
    }
    return MoveState;
}());
MoveState.STANDING = 0;
MoveState.RUNNING = 1;
MoveState.JUMPING = 2;
MoveState.FALLING = 3;
var Facing = (function () {
    function Facing() {
    }
    return Facing;
}());
Facing.DOWN = 0;
Facing.UP = 1;
Facing.RIGHT = 2;
Facing.LEFT = 3;
var Point = (function () {
    function Point(x, y, z) {
        if (z === void 0) { z = 0; }
        this.x = x;
        this.y = y;
        this.z = z;
    }
    return Point;
}());
var GameMover = (function (_super) {
    __extends(GameMover, _super);
    function GameMover(x, y, lb, tb, rb, bb, img_name, max_run_vel, jump_vel, terminal_vel) {
        if (max_run_vel === void 0) { max_run_vel = 1.5; }
        if (jump_vel === void 0) { jump_vel = 4.5; }
        if (terminal_vel === void 0) { terminal_vel = 7.0; }
        var _this = _super.call(this, x, y, lb, tb, rb, bb, img_name) || this;
        _this.horizontal_input = false;
        _this.vertical_input = false;
        _this.mult = 0;
        _this.original_grav_acc = 0.8;
        _this.float_grav_acc = 0.4;
        _this.grav_acc = 0.8;
        _this.jump_timer = 0;
        _this.jump_time_limit = 30;
        _this.jump_acc = 35.0;
        _this.is_jumping = false;
        _this.was_on_ground = true;
        _this.true_on_ground = true;
        _this.on_ground = true;
        _this.played_land_sound = true;
        _this.move_state = MoveState.STANDING;
        _this.prev_move_state = MoveState.STANDING;
        _this.facing = Facing.RIGHT;
        _this.original_facing = Facing.RIGHT;
        _this.die_to_suffocation = false;
        _this.left_flip_offset = 0;
        _this.horizontal_collision = false;
        _this.vertical_collision = false;
        _this.pressing_down = false;
        _this.pressed_down = false;
        _this.has_double_jumped = false;
        _this.has_triple_jumped = false;
        _this.stuck_in_wall = false;
        _this.vel = new Point(0, 0);
        _this.prev_vel = new Point(0, 0);
        _this.type = "GameMover";
        _this.prev_x = _this.x;
        _this.prev_y = _this.y;
        _this.max_run_vel = max_run_vel; //pixels/second
        _this.gnd_run_acc = _this.max_run_vel / 3.0;
        _this.gnd_run_dec = _this.max_run_vel / 3.0;
        _this.air_run_acc = _this.max_run_vel / 3.0;
        _this.air_run_dec = _this.max_run_vel / 3.0;
        _this.jump_vel = jump_vel;
        _this.terminal_vel = terminal_vel;
        _this.previous_bottom = _this.y + _this.bb;
        return _this;
    }
    GameMover.prototype.Import = function (obj) {
        _super.prototype.Import.call(this, obj);
        this.max_run_vel = obj.max_run_vel;
        this.jump_vel = obj.jump_vel;
        this.terminal_vel = obj.terminal_vel;
        this.facing = obj.facing || this.facing;
    };
    GameMover.prototype.Export = function () {
        var obj = _super.prototype.Export.call(this);
        obj.max_run_vel = this.max_run_vel;
        obj.jump_vel = this.jump_vel;
        obj.terminal_vel = this.terminal_vel;
        return obj;
    };
    GameMover.prototype.ResetPosition = function () {
        _super.prototype.ResetPosition.call(this);
        this.facing = this.original_facing;
    };
    GameMover.prototype.Update = function (map) {
        this.DieToSuffocation(map);
        if (!this.stuck_in_wall) {
            this.ApplyPhysics(map);
            this.prev_x = this.x;
            this.prev_y = this.y;
            if (!this.on_ground) {
                if (!this.was_on_ground)
                    this.pressed_down = false;
                if (this.vel.z < 0)
                    this.move_state = MoveState.JUMPING;
                else
                    this.move_state = MoveState.FALLING;
            }
        }
        this.UpdateAnimationFromState();
        this.prev_move_state = this.move_state;
        this.prev_vel.x = this.vel.x;
        this.prev_vel.y = this.vel.y;
        this.prev_vel.z = this.vel.z;
        _super.prototype.Update.call(this, map);
    };
    /*********************PHYSICS AND COLLISION DETECTIONS********************/
    GameMover.prototype.DieToSuffocation = function (map) {
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
        for (var i = top_tile; i <= bottom_tile; i++) {
            for (var j = left_tile; j <= right_tile; j++) {
                if (!map.isValidTile(i, j))
                    continue;
                var tile = map.tiles[i][j];
                if (tile.collision !== Tile.SOLID || tile.collision !== Tile.SUPER_SOLID) {
                    continue;
                }
                //left collisions
                if (this.IsRectColliding(tile, this.x + this.lb, this.y + this.tb + q, this.x + this.lb, this.y + this.bb - q)) {
                    left_collision = true;
                    if (right_collision) {
                        dead = true;
                        break;
                    }
                }
                //right collisions
                if (this.IsRectColliding(tile, this.x + this.rb, this.y + this.tb + q, this.x + this.rb, this.y + this.bb - q)) {
                    right_collision = true;
                    if (left_collision) {
                        dead = true;
                        break;
                    }
                }
                //top collisions
                if (tile.collision != Tile.FALLTHROUGH && this.IsRectColliding(tile, this.x + this.lb + q, this.y + this.tb, this.x + this.rb - q, this.y + this.tb)) {
                    top_collision = true;
                    if (bottom_collision) {
                        dead = true;
                        break;
                    }
                }
                //bottom collisions
                if (this.IsRectColliding(tile, this.x + this.lb + q, this.y + this.bb, this.x + this.rb - q, this.y + this.bb)) {
                    bottom_collision = true;
                    if (top_collision) {
                        dead = true;
                        break;
                    }
                }
            }
            if (dead)
                break;
        }
        //console.log("dead: " + dead + ", left: " + left_collision + ", right: " + right_collision + ", top: " + top_collision + ", bottom: " + bottom_collision);
        if (dead) {
            this.stuck_in_wall = true;
            //this.Die();
        }
        else {
            this.stuck_in_wall = false;
        }
    };
    GameMover.prototype.Die = function () { };
    GameMover.prototype.ApplyPhysics = function (map) {
        var prev_pos = { x: this.x, y: this.y };
        this.ApplyGravity();
        if (!this.vertical_input)
            this.VerticalMoveStop();
        if (!this.horizontal_input)
            this.HorizontalMoveStop();
        this.HandleCollisionsAndMove(map);
        if (this.x == prev_pos.x)
            this.vel.x = 0;
        if (this.y == prev_pos.y)
            this.vel.y = 0;
        this.previous_bottom = this.y + this.bb;
    };
    GameMover.prototype.ApplyGravity = function () {
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
    };
    GameMover.prototype.HandleCollisionsAndMove = function (map) {
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
        for (var i = top_tile; i <= bottom_tile; i++) {
            for (var j = left_tile; j <= right_tile; j++) {
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
        }
        else
            this.x += this.vel.x;
        this.HandleVerticalCollisions(tiles, map.entities, q_vert);
        if (this.horizontal_input && this.vel.x != 0) {
            this.y += this.vel.y * 0.75;
        }
        else
            this.y += this.vel.y;
    };
    GameMover.prototype.PlayLandSound = function (vel_key) {
        if (this.prev_vel[vel_key] != 0)
            Utils.playSound("land");
    };
    GameMover.prototype.HandleLeftCollision = function (object, q) {
        if (this.vel.x < 0 && this.IsRectColliding(object, this.x + this.lb + this.vel.x - 1, this.y + this.tb + q, this.x + this.lb, this.y + this.bb - q)) {
            this.PlayLandSound('x');
            this.vel.x = 0;
            this.horizontal_collision = true;
            this.x = object.x + object.rb - this.lb;
        }
    };
    GameMover.prototype.HandleRightCollision = function (object, q) {
        if (this.vel.x > 0 && this.IsRectColliding(object, this.x + this.rb, this.y + this.tb + q, this.x + this.rb + this.vel.x + 2, this.y + this.bb - q)) {
            this.PlayLandSound('x');
            this.vel.x = 0;
            this.horizontal_collision = true;
            this.x = object.x - this.rb;
        }
    };
    GameMover.prototype.HandleHorizontalCollisions = function (tiles, entities, q) {
        this.horizontal_collision = false;
        //Check all potentially colliding tiles
        for (var i = 0; i < tiles.length; i++) {
            var tile = tiles[i];
            //don't check for collisions if potential tile is not solid
            if (tile.collision != Tile.SOLID &&
                tile.collision != Tile.SUPER_SOLID)
                continue;
            this.HandleLeftCollision(tile, q);
            this.HandleRightCollision(tile, q);
        }
        for (i = 0; i < entities.length; i++) {
            if (!entities[i].solid)
                continue;
            if (entities[i] === this)
                continue;
            this.HandleLeftCollision(entities[i], q);
            this.HandleRightCollision(entities[i], q);
        }
    };
    GameMover.prototype.HandleTopCollision = function (object, q) {
        if (this.vel.y < 0 && this.IsRectColliding(object, this.x + this.lb + q, this.y + this.tb + this.vel.y - 1, this.x + this.rb - q, this.y + this.tb)) {
            this.PlayLandSound('y');
            this.vel.y = 0;
            this.y = object.y + object.bb - this.tb;
        }
    };
    GameMover.prototype.HandleBottomCollision = function (object, q) {
        //Check for bottom collisions
        if (this.vel.y >= 0 && this.IsRectColliding(object, this.x + this.lb + q, this.y + this.bb, this.x + this.rb - q, this.y + this.bb + this.vel.y + 2)) {
            this.PlayLandSound('y');
            this.vel.y = 0;
            this.y = object.y - this.bb;
        }
    };
    GameMover.prototype.HandleVerticalCollisions = function (tiles, entities, q) {
        //Check all potentially colliding tiles
        for (var i = 0; i < tiles.length; i++) {
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
        for (i = 0; i < entities.length; i++) {
            if (!entities[i].solid)
                continue;
            if (entities[i] === this)
                continue;
            this.HandleTopCollision(entities[i], q);
            this.HandleBottomCollision(entities[i], q);
        }
    };
    /******************RENDER AND ANIMATION FUNCTIONS***********************/
    GameMover.prototype.UpdateAnimationFromState = function () {
        var ani_y = 0; // let Facing.DOWN be default ani_y = 0;
        if (this.facing == Facing.UP)
            ani_y = 1;
        if (this.facing == Facing.RIGHT)
            ani_y = 2;
        if (this.facing == Facing.LEFT)
            ani_y = 3;
        switch (this.move_state) {
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
                }
                else {
                    this.animation.frame_delay = 8;
                }
                break;
            default: break;
        }
    };
    /*******************FUNCTIONS FOR MOVEMENT INPUT BY OBJECT*****************/
    GameMover.prototype.MoveLeft = function () {
        this.facing = Facing.LEFT;
        this.HorizontalMove(-1);
    };
    GameMover.prototype.MoveRight = function () {
        this.facing = Facing.RIGHT;
        this.HorizontalMove(1);
    };
    GameMover.prototype.MoveUp = function () {
        this.facing = Facing.UP;
        this.VerticalMove(-1);
    };
    GameMover.prototype.MoveDown = function () {
        this.facing = Facing.DOWN;
        this.VerticalMove(1);
    };
    GameMover.prototype.HorizontalMove = function (mult) {
        this.horizontal_input = true;
        this.Move(mult, 'x');
    };
    GameMover.prototype.VerticalMove = function (mult) {
        this.vertical_input = true;
        this.Move(mult, 'y');
    };
    GameMover.prototype.Move = function (mult, vel_key) {
        this.pressed_down = false;
        // pivot snap turn opposite directions
        if ((this.vel[vel_key] * mult) < 0)
            this.vel[vel_key] = 0;
        var acc;
        if (this.on_ground) {
            acc = this.gnd_run_acc;
            this.move_state = MoveState.RUNNING;
        }
        else {
            acc = this.air_run_acc;
        }
        var max_run_vel = this.max_run_vel;
        if (Math.abs(this.vel[vel_key]) < max_run_vel) {
            this.vel[vel_key] += (acc * mult);
            this.CorrectVelocity(mult, vel_key);
        }
        else if (Math.abs(this.vel[vel_key]) > max_run_vel) {
            this.vel[vel_key] -= (acc * mult);
            if (Math.abs(this.vel[vel_key]) < max_run_vel) {
                this.vel.x = max_run_vel * mult;
            }
        }
        else if (Math.abs(this.vel[vel_key]) == max_run_vel
            && this.vel[vel_key] != max_run_vel * mult) {
            this.vel[vel_key] += (acc * mult);
        }
    };
    GameMover.prototype.HorizontalMoveStop = function () {
        this.MoveStop('x');
    };
    GameMover.prototype.VerticalMoveStop = function () {
        this.MoveStop('y');
    };
    GameMover.prototype.MoveStop = function (vel_key) {
        var run_dec = this.gnd_run_dec;
        if (!this.on_ground)
            run_dec = this.air_run_dec;
        if (this.vel[vel_key] > 0) {
            this.vel[vel_key] -= (this.gnd_run_dec);
            if (this.vel[vel_key] < 0)
                this.vel[vel_key] = 0;
        }
        else if (this.vel[vel_key] < 0) {
            this.vel[vel_key] += (this.gnd_run_dec);
            if (this.vel[vel_key] > 0)
                this.vel[vel_key] = 0;
        }
        if (this.on_ground && !this.vertical_input && !this.horizontal_input) {
            this.move_state = MoveState.STANDING;
        }
    };
    GameMover.prototype.CorrectVelocity = function (mult, vel_key) {
        if (Math.abs(this.vel[vel_key]) > this.max_run_vel) {
            this.vel[vel_key] = this.max_run_vel * mult;
        }
    };
    GameMover.prototype.StartJump = function () {
        if (this.on_ground) {
            Utils.playSound("jump");
            this.vel.y = -this.jump_vel;
            this.is_jumping = true;
            this.jump_timer = 0;
            this.on_ground = false;
        }
    };
    GameMover.prototype.Jump = function () {
        if (this.is_jumping) {
            this.jump_timer++;
            if (this.jump_timer >= this.jump_time_limit) {
                this.jump_timer = 0;
                this.is_jumping = false;
                this.grav_acc = this.original_grav_acc;
            }
            else {
                this.grav_acc = this.float_grav_acc;
                // TODO(jaketrower): change to z (roc's feather)
                // this.vel.y += (-this.jump_vel * ((this.jump_time_limit - (this.jump_timer/2)) / (this.jump_time_limit * 60)));
            }
        }
    };
    GameMover.prototype.StopJump = function () {
        this.is_jumping = false;
        this.grav_acc = this.original_grav_acc;
    };
    return GameMover;
}(GameSprite));
