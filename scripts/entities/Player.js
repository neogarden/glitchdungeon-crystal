function Player(x, y){
	GameMover.call(this, x, y, 2, 2, 14, 16, "player_grey_sheet");
	this.type = "Player";
	this.animation.frame_height = 16;
	this.touching_door = false;
	this.touching_checkpoint = false;
    
    this.num_deaths = 0;
	this.spells_cast = 0;

    //INVENTORY 
	this.inventory = {
        spellbook: {
            active: false,
            spells: []
        },
        artifacts: []
    };
    
	this.glitch_type = Glitch.GREY;
	this.glitch_index = -1;
	
	//inventory and state
	this.spellbook = [];
	this.has_spellbook = false;
	this.NumArtifacts = function(){ return this.spellbook.length; }
	
	this.z_index = -100;
	this.hat_image = resource_manager.hat_grey_sheet;
}
extend(GameMover, Player);

/*---------------------------------------------------------------*/
//              FUNCTIONS TO SAVE/LOAD IN NORMAL GAMEPLAY
//  assumes that appropriate IMPORT function has already been called
Player.prototype.Load = function(obj){
    this.inventory = obj.inventory;
    this.glitch_type = obj.glitch_type;
    this.glitch_index = obj.glitch_index;
    this.num_deaths = obj.num_deaths;
    this.spells_cast = obj.spells_cast;
    this.Parent().Load.call(this, obj);
}
Player.prototype.Save = function(){
    var obj = this.Parent().Save.call(this);
    obj.inventory = this.inventory;
    obj.glitch_type = this.glitch_type;
    obj.glitch_index = this.glitch_index;
    obj.num_deaths = this.num_deaths;
    obj.spells_cast = this.spells_cast;
    return obj;
}
/*---------------------------------------------------------------*/
//              FUNCTIONS TO IMPORT/EXPORT to save level design to file
//  includes all necessary information to create object from class template
Player.prototype.Import = function(obj){
	GameMover.prototype.Import.call(this, obj);
}
Player.prototype.Export = function(){
	var obj = GameMover.prototype.Export.call(this);
	obj.img_name = "player_grey_sheet";
	return obj;
}
/*---------------------------------------------------------------*/

Player.prototype.Update = function(map){
	this.DieToSpikesAndStuff(map);
	GameMover.prototype.Update.call(this, map);
	this.touching_door = false;
	this.touching_checkpoint = false;
}

Player.prototype.PressX = function(){
}

Player.prototype.NextGlitch = function(){
    if (!this.inventory.spellbook.active) return;
	this.spells_cast++;
	Utils.playSound("switchglitch", master_volume, 0);

	/*var rindex = Math.floor(Math.random()*this.spellbook.length);
	var glitch = this.spellbook[rindex];
	while (this.spellbook.length > 1 && glitch == this.glitch_type){
		rindex++;
		if (rindex >= this.spellbook.length) rindex = 0;
		glitch = this.spellbook[rindex];
	}*/
	this.glitch_index++;
	if (this.glitch_index >= this.inventory.spellbook.spells.length)
		this.glitch_index = 0; //-1;
		
	if (this.glitch_index < 0){
		//room.glitch_time = room.glitch_time_limit;
		this.glitch_type = Glitch.GREY;
	}
	if (this.glitch_index >= 0){
		this.glitch_type = this.inventory.spellbook.spells[this.glitch_index];
		room.glitch_time = 0;
	}
	
	room.glitch_type = this.glitch_type;
	Glitch.TransformPlayer(room, this.glitch_type);
}

Player.prototype.PrevGlitch = function(){
    room_manager.glitch_index-=2;
    if (room_manager.glitch_index < 0)
        room_manager.glitch_index = room_manager.spellbook.length + room_manager.glitch_index;
    this.NextGlitch();
}

Player.prototype.DieToSpikesAndStuff = function(map){
	var q = 3;
	var x = this.x;
	var y = this.y;
	var lb = this.lb;
	var tb = this.tb;
	var rb = this.rb;
	var bb = this.bb;
	for (var i = 0; i < map.entities.length; i++){
		if (map.entities[i].kill_player && (this.IsRectColliding(map.entities[i], x+lb+q, y+tb+q,x+rb-q,y+bb-q))){
			this.Die();
			return;
		}
	}

	//Colliding with spikes
	var left_tile = Math.floor((this.x + this.lb + this.vel.x - 1) / Tile.WIDTH);
	var right_tile = Math.ceil((this.x + this.rb + this.vel.x + 1) / Tile.WIDTH);
	var top_tile = Math.floor((this.y + this.tb + this.vel.y - 1) / Tile.HEIGHT);
	var bottom_tile = Math.ceil((this.y + this.bb + this.vel.y + 1) / Tile.HEIGHT);
	
	for (var i = top_tile; i <= bottom_tile; i++){
		for (var j = left_tile; j <= right_tile; j++){
			if (!map.isValidTile(i, j)) continue;
			var tile = map.tiles[i][j];
			if (tile.collision != Tile.KILL_PLAYER && !tile.kill_player) continue;
			
			if (this.IsRectColliding(tile, x+lb+q, y+tb+q,x+rb-q,y+bb-q)){
				this.Die();
				return;
			}
		}
	}
}

Player.prototype.Die = function(){
	Utils.playSound("hurt", master_volume, 0);
    this.num_deaths++;
	room_manager.RevivePlayer();
}

Player.prototype.Render = function(ctx, camera){
	if (this.image === null || !this.visible) return;
	var ani = this.animation;
	var row = ani.rel_ani_y;
	var column = ani.rel_ani_x + ani.curr_frame;
	
	ctx.drawImage(this.image, 
		//SOURCE RECTANGLE
		ani.frame_width * column + ani.abs_ani_x + this.base_ani_x,
		ani.frame_height * row + ani.abs_ani_y + this.base_ani_y,
		ani.frame_width, ani.frame_height,
		//DESTINATION RECTANGLE
		~~(this.x-camera.x+camera.screen_offset_x+0.5) + ani.x_offset, 
		~~(this.y-camera.y+camera.screen_offset_y+0.5)+ani.y_offset,
		ani.frame_width, ani.frame_height
	);
	
	var f = -1;
	if (this.facing === Facing.LEFT) f = 1;
	
	//NOW DRAW THE HAT
	if (!room_manager.beat_game) return;
	ctx.drawImage(this.hat_image, 
		//SOURCE RECTANGLE
		ani.frame_width * column + ani.abs_ani_x + this.base_ani_x,
		ani.frame_height * row + ani.abs_ani_y + this.base_ani_y,
		ani.frame_width, ani.frame_height,
		//DESTINATION RECTANGLE
		~~(this.x-camera.x+camera.screen_offset_x+0.5) + ani.x_offset + f, 
		~~(this.y-camera.y+camera.screen_offset_y+0.5)+ani.y_offset - 6,
		ani.frame_width, ani.frame_height
	);
}