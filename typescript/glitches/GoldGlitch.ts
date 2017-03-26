Glitch.GoldTransform = function(map, only_visual){
  player.img_name = "player_gold_sheet";
  if (only_visual) return;
  map.tilesheet_name = "tile_gold_sheet";

  player.HandleLeftCollision = function(object, q){
      if (this.vel.x < 0 && this.IsRectColliding(object,
          this.x + this.lb + this.vel.x - 1,
          this.y + this.tb + q,
          this.x + this.lb,
          this.y + this.bb - q)){

              this.vel.x = 0;
              this.horizontal_collision = true;
              this.x = object.x + object.rb - this.lb;

              // NEW ADDITIONS
              this.vel.y = -1;
              this.move_state = MoveState.RUNNING;
              this.on_ground = true;
      }
  }

  player.HandleRightCollision = function(object, q){
      if (this.vel.x > 0 && this.IsRectColliding(object,
          this.x + this.rb,
          this.y + this.tb + q,
          this.x + this.rb + this.vel.x + 2,
          this.y + this.bb - q)){

              this.vel.x = 0;
              this.horizontal_collision = true;
              this.x = object.x - this.rb;

              // NEW ADDITIONS
              this.vel.y = -1;
              this.move_state = MoveState.RUNNING;
              this.on_ground = true;
      }
  }
}
