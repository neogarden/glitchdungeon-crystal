var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var MoveState = (function () {
    function MoveState() {
    }
    MoveState.STANDING = 0;
    MoveState.RUNNING = 1;
    MoveState.JUMPING = 2;
    MoveState.FALLING = 3;
    return MoveState;
}());
var Facing = (function () {
    function Facing() {
    }
    Facing.LEFT = 0;
    Facing.RIGHT = 1;
    return Facing;
}());
var Point = (function () {
    function Point(x, y) {
        this.x = x;
        this.y = y;
    }
    return Point;
}());
var GameMover = (function (_super) {
    __extends(GameMover, _super);
    function GameMover(x, y, lb, tb, rb, bb, img_name, max_run_vel, jump_vel, terminal_vel) {
        if (max_run_vel === void 0) { max_run_vel = 1.5; }
        if (jump_vel === void 0) { jump_vel = 4.5; }
        if (terminal_vel === void 0) { terminal_vel = 7.0; }
        _super.call(this, x, y, lb, tb, rb, bb, img_name);
        this.horizontal_input = false;
        this.mult = 0;
        this.original_grav_acc = 0.8;
        this.float_grav_acc = 0.4;
        this.grav_acc = 0.8;
        this.jump_timer = 0;
        this.jump_time_limit = 30;
        this.jump_acc = 35.0;
        this.is_jumping = false;
        this.was_on_ground = true;
        this.true_on_ground = true;
        this.on_ground = true;
        this.played_land_sound = true;
        this.move_state = MoveState.STANDING;
        this.prev_move_state = MoveState.STANDING;
        this.facing = Facing.RIGHT;
        this.original_facing = Facing.RIGHT;
        this.die_to_suffocation = false;
        this.left_flip_offset = 0;
        this.horizontal_collision = false;
        this.vertical_collision = false;
        this.pressing_down = false;
        this.pressed_down = false;
        this.has_double_jumped = false;
        this.has_triple_jumped = false;
        this.stuck_in_wall = false;
        this.vel = new Point(0, 0);
        this.type = "GameMover";
        this.prev_x = this.x;
        this.prev_y = this.y;
        this.max_run_vel = max_run_vel;
        this.gnd_run_acc = this.max_run_vel / 3.0;
        this.gnd_run_dec = this.max_run_vel / 3.0;
        this.air_run_acc = this.max_run_vel / 3.0;
        this.air_run_dec = this.max_run_vel / 3.0;
        this.jump_vel = jump_vel;
        this.terminal_vel = terminal_vel;
        this.previous_bottom = this.y + this.bb;
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
                if (this.vel.y < 0)
                    this.move_state = MoveState.JUMPING;
                else
                    this.move_state = MoveState.FALLING;
            }
        }
        this.UpdateAnimationFromState();
        _super.prototype.Update.call(this, map);
    };
    GameMover.prototype.DieToSuffocation = function (map) {
        this.die_to_suffocation = false;
        var left_tile = Math.floor((this.x + this.lb) / Tile.WIDTH);
        var right_tile = Math.floor((this.x + this.rb) / Tile.WIDTH);
        var top_tile = Math.floor((this.y + this.tb) / Tile.HEIGHT);
        var bottom_tile = Math.floor((this.y + this.bb) / Tile.HEIGHT);
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
                if (this.IsRectColliding(tile, this.x + this.lb, this.y + this.tb + q, this.x + this.lb, this.y + this.bb - q)) {
                    left_collision = true;
                    if (right_collision) {
                        dead = true;
                        break;
                    }
                }
                if (this.IsRectColliding(tile, this.x + this.rb, this.y + this.tb + q, this.x + this.rb, this.y + this.bb - q)) {
                    right_collision = true;
                    if (left_collision) {
                        dead = true;
                        break;
                    }
                }
                if (tile.collision != Tile.FALLTHROUGH && this.IsRectColliding(tile, this.x + this.lb + q, this.y + this.tb, this.x + this.rb - q, this.y + this.tb)) {
                    top_collision = true;
                    if (bottom_collision) {
                        dead = true;
                        break;
                    }
                }
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
        if (dead) {
            this.stuck_in_wall = true;
        }
        else {
            this.stuck_in_wall = false;
        }
    };
    GameMover.prototype.Die = function () { };
    GameMover.prototype.ApplyPhysics = function (map) {
        var prev_pos = { x: this.x, y: this.y };
        this.ApplyGravity();
        if (!this.horizontal_input)
            this.MoveStop();
        this.HandleCollisionsAndMove(map);
        if (this.x == prev_pos.x)
            this.vel.x = 0;
        if (this.y == prev_pos.y)
            this.vel.y = 0;
        this.previous_bottom = this.y + this.bb;
    };
    GameMover.prototype.ApplyGravity = function () {
        if (!this.on_ground) {
            if (this.vel.y < this.terminal_vel) {
                this.vel.y += (this.grav_acc);
                if (this.vel.y > this.terminal_vel)
                    this.vel.y = this.terminal_vel;
            }
            else if (this.vel.y > this.terminal_vel) {
                this.vel.y -= (this.grav_acc);
                if (this.vel.y < this.terminal_vel)
                    this.vel.y = this.terminal_vel;
            }
        }
        else {
            this.vel.y = 0;
        }
    };
    GameMover.prototype.HandleCollisionsAndMove = function (map) {
        var left_tile = Math.floor((this.x + this.lb + this.vel.x - 1) / Tile.WIDTH);
        var right_tile = Math.ceil((this.x + this.rb + this.vel.x + 1) / Tile.WIDTH);
        var top_tile = Math.floor((this.y + this.tb + this.vel.y - 1) / Tile.HEIGHT);
        var bottom_tile = Math.ceil((this.y + this.bb + this.vel.y + 1) / Tile.HEIGHT);
        this.was_on_ground = this.on_ground;
        this.on_ground = false;
        this.true_on_ground = false;
        var q_horz = 3;
        var q_vert = 3;
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
        this.x += this.vel.x;
        this.HandleVerticalCollisions(tiles, map.entities, q_vert);
        this.y += this.vel.y;
        if (this.vel.y != 0)
            this.played_land_sound = false;
    };
    GameMover.prototype.HandleLeftCollision = function (object, q) {
        if (this.vel.x < 0 && this.IsRectColliding(object, this.x + this.lb + this.vel.x - 1, this.y + this.tb + q, this.x + this.lb, this.y + this.bb - q)) {
            this.vel.x = 0;
            this.horizontal_collision = true;
            this.x = object.x + object.rb - this.lb;
        }
    };
    GameMover.prototype.HandleRightCollision = function (object, q) {
        if (this.vel.x > 0 && this.IsRectColliding(object, this.x + this.rb, this.y + this.tb + q, this.x + this.rb + this.vel.x + 2, this.y + this.bb - q)) {
            this.vel.x = 0;
            this.horizontal_collision = true;
            this.x = object.x - this.rb;
        }
    };
    GameMover.prototype.HandleHorizontalCollisions = function (tiles, entities, q) {
        this.horizontal_collision = false;
        for (var i = 0; i < tiles.length; i++) {
            var tile = tiles[i];
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
            this.vel.y = 0;
            this.y = object.y + object.bb - this.tb;
        }
    };
    GameMover.prototype.HandleBottomCollision = function (object, q) {
        if (this.vel.y >= 0 && this.IsRectColliding(object, this.x + this.lb + q, this.y + this.bb, this.x + this.rb - q, this.y + this.bb + this.vel.y + 2)) {
            if (!this.played_land_sound) {
                Utils.playSound("land");
                this.played_land_sound = true;
            }
            this.vel.y = 0;
            this.on_ground = true;
            this.true_on_ground = true;
            this.has_double_jumped = false;
            this.has_triple_jumped = false;
            this.y = object.y - this.bb;
        }
    };
    GameMover.prototype.HandleVerticalCollisions = function (tiles, entities, q) {
        for (var i = 0; i < tiles.length; i++) {
            var tile = tiles[i];
            if (tile.collision != Tile.FALLTHROUGH)
                this.HandleTopCollision(tile, q);
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
    GameMover.prototype.UpdateAnimationFromState = function () {
        switch (this.move_state) {
            case MoveState.STANDING:
                this.animation.Change(0, 0, 2);
                break;
            case MoveState.RUNNING:
                this.animation.Change(2, 0, 4);
                if (this.prev_move_state == MoveState.FALLING || this.prev_move_state == MoveState.JUMPING)
                    this.animation.curr_frame = 1;
                break;
            case MoveState.JUMPING:
                this.animation.Change(0, 1, 2);
                break;
            case MoveState.FALLING:
                this.animation.Change(4, 1, 2);
                break;
            default: break;
        }
        if (this.facing == Facing.LEFT) {
            this.animation.abs_ani_y = 2 * this.animation.frame_height;
        }
        else if (this.facing == Facing.RIGHT) {
            this.animation.abs_ani_y = 0;
        }
        this.prev_move_state = this.move_state;
    };
    GameMover.prototype.MoveLeft = function () {
        this.facing = Facing.LEFT;
        this.Move(-1);
    };
    GameMover.prototype.MoveRight = function () {
        this.facing = Facing.RIGHT;
        this.Move(1);
    };
    GameMover.prototype.Move = function (mult) {
        this.mult = mult;
        this.pressed_down = false;
        var acc;
        this.horizontal_input = true;
        if ((this.vel.x * mult) < 0)
            this.vel.x = 0;
        if (this.on_ground) {
            acc = this.gnd_run_acc;
            this.move_state = MoveState.RUNNING;
        }
        else {
            acc = this.air_run_acc;
        }
        if (Math.abs(this.vel.x) < this.max_run_vel) {
            this.vel.x += (acc * mult);
            this.CorrectVelocity(mult);
        }
        else if (Math.abs(this.vel.x) > this.max_run_vel) {
            this.vel.x -= (acc * mult);
            if (Math.abs(this.vel.x) < this.max_run_vel)
                this.vel.x = this.max_run_vel * mult;
        }
        else if (Math.abs(this.vel.x) == this.max_run_vel && this.vel.x != this.max_run_vel * mult) {
            this.vel.x += (acc * mult);
        }
    };
    GameMover.prototype.MoveStop = function () {
        this.mult = 0;
        if (this.on_ground) {
            if (this.vel.x > 0) {
                this.vel.x -= (this.gnd_run_dec);
                if (this.vel.x < 0)
                    this.vel.x = 0;
            }
            else if (this.vel.x < 0) {
                this.vel.x += (this.gnd_run_dec);
                if (this.vel.x > 0)
                    this.vel.x = 0;
            }
            this.move_state = MoveState.STANDING;
        }
        else {
            if (this.vel.x > 0) {
                this.vel.x -= (this.air_run_dec);
                if (this.vel.x < 0)
                    this.vel.x = 0;
            }
            else if (this.vel.x < 0) {
                this.vel.x += (this.air_run_dec);
                if (this.vel.x > 0)
                    this.vel.x = 0;
            }
        }
    };
    GameMover.prototype.CorrectVelocity = function (mult) {
        if (Math.abs(this.vel.x) > this.max_run_vel)
            this.vel.x = this.max_run_vel * mult;
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
                this.vel.y += (-this.jump_vel * ((this.jump_time_limit - (this.jump_timer / 2)) / (this.jump_time_limit * 60)));
            }
        }
    };
    GameMover.prototype.StopJump = function () {
        this.is_jumping = false;
        this.grav_acc = this.original_grav_acc;
    };
    GameMover.prototype.StartPressingDown = function () {
        this.pressed_down = true;
        this.pressing_down = true;
    };
    GameMover.prototype.PressDown = function () {
        this.pressed_down = false;
        this.pressing_down = true;
        this.on_ground = false;
    };
    GameMover.prototype.StopPressingDown = function () {
        this.pressing_down = false;
        this.pressed_down = false;
    };
    return GameMover;
}(GameSprite));
