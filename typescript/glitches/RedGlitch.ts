Glitch.RedTransform = function(map, only_visual){
  player.img_name = "player_red_sheet";
  if (only_visual) return;
  map.tilesheet_name = "tile_red_sheet";

  player.HandleCollisionsAndMove = function(map){
        var left_tile = Math.floor((this.x + this.lb + this.vel.x - 1) / Tile.WIDTH);
      var right_tile = Math.ceil((this.x + this.rb + this.vel.x + 1) / Tile.WIDTH);
      var top_tile = Math.floor((this.y + this.tb + this.vel.y - 1) / Tile.HEIGHT);
      var bottom_tile = Math.ceil((this.y + this.bb + this.vel.y + 1) / Tile.HEIGHT);

      // Reset flag to search for ground collision.
      this.was_on_ground = this.on_ground;
      //this.on_ground = false;
      this.true_on_ground = false;
      var q_horz = 3; //q is used to minimize height checked in horizontal collisions and etc.
      var q_vert = 3;

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
      this.x += this.vel.x;
      this.HandleVerticalCollisions(tiles, map.entities, q_vert);
      this.y += this.vel.y;

      if (this.vel.y != 0)
            this.played_land_sound = false;
  }
}
