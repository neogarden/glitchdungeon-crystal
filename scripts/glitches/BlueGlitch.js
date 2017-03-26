Glitch.BlueTransform = function (map, only_visual) {
    player.img_name = "player_blue_sheet";
    if (only_visual)
        return;
    map.tilesheet_name = "tile_blue_sheet";
    player.tb = 0;
    player.bb = 14;
    player.ApplyGravity = function (map) {
        if (!this.on_ground) {
            if (this.vel.y > -this.terminal_vel) {
                this.vel.y -= (this.grav_acc);
                if (this.vel.y < -this.terminal_vel)
                    this.vel.y = -this.terminal_vel;
            }
            else if (this.vel.y < -this.terminal_vel) {
                this.vel.y += (this.grav_acc);
                if (this.vel.y > -this.terminal_vel)
                    this.vel.y = -this.terminal_vel;
            }
        }
        else {
            this.vel.y = 0;
        }
    };
    player.HandleTopCollision = function (object, q) {
        if (this.vel.y <= 0 &&
            this.IsRectColliding(object, this.x + this.lb + q, this.y + this.tb + this.vel.y - 2, this.x + this.rb - q, this.y + this.tb)) {
            this.vel.y = 0;
            this.y = object.y + object.bb - this.tb;
            if (!this.played_land_sound) {
                Utils.playSound("land");
                this.played_land_sound = true;
            }
            this.on_ground = true;
            this.true_on_ground = true;
            this.has_double_jumped = false;
            this.has_triple_jumped = false;
        }
    };
    player.HandleBottomCollision = function (object, q) {
        //Check for bottom collisions
        if (this.vel.y > 0 && this.IsRectColliding(object, this.x + this.lb + q, this.y + this.bb, this.x + this.rb - q, this.y + this.bb + this.vel.y + 1)) {
            this.vel.y = 0;
            this.y = object.y - this.bb;
        }
    };
    player.StartJump = function () {
        if (this.on_ground) {
            Utils.playSound("jump");
            this.vel.y = this.jump_vel;
            this.is_jumping = true;
            this.jump_timer = 0;
            this.on_ground = false;
        }
    };
    player.Jump = function () {
        if (this.is_jumping) {
            this.jump_timer++;
            if (this.jump_timer >= this.jump_time_limit) {
                this.jump_timer = 0;
                this.is_jumping = false;
                this.grav_acc = this.original_grav_acc;
            }
            else {
                this.grav_acc = this.float_grav_acc;
                this.vel.y += (this.jump_vel * ((this.jump_time_limit - (this.jump_timer / 2)) / (this.jump_time_limit * 60)));
            }
        }
    };
};
