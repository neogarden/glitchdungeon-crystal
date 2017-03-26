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
  player.jump_vel = 3.0;
  player.has_double_jumped = false;
  player.has_triple_jumped = false;

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
