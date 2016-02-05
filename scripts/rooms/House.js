function House(){
	this.path = "assets/rooms";
	this.num_deaths = 0;
	this.spells_cast = 0;
	this.then = Date.now();
	this.time = 0;
	this.beat_game = false;
	this.submitted = false;

	this.room_index_x = 0;
	this.room_index_y = 0;

	this.has_spellbook = false;
	this.spellbook = [];
	this.glitch_type = Glitch.GREY;
	this.glitch_index = -1;

    //extending the rooms to levels
    this.level_spellbooks = [this.spellbook];
}
House.Levels = {
    "dungeon": 0,
    "ocean": 1,
};
House.GetLevels = function(){
    var levels = []
    for (level in House.Levels){
        levels.push({"name": level, "value": House.Levels[level]});
    }
    return levels;
}

/********************************************************************/
House.prototype.Restart = function(){
	this.then = Date.now();
	this.time = 0;
	this.submitted = false;

	this.room_index_x = 0;
	this.room_index_y = 0;

	room = this.rooms[this.room_index_x][this.room_index_y];
	player.x = 20;
	player.y = 72;
	player.facing = Facing.RIGHT;
	player.vel = {x: 0, y: 0};
	player.stuck_in_wall = false;
	this.DeactivateCheckpoints();
	this.checkpoint = {
		x: player.x, y: player.y,
		room_x: this.room_index_x,
		room_y: this.room_index_y,
		facing: player.facing
	};
	this.old_checkpoint = null;
	this.new_checkpoint = null;
	player = player;
}

House.prototype.New = function(){
	this.room_index_x = 0;
	this.room_index_y = 0;
	this.old_room_index_x = 0;
	this.old_room_index_y = 0;
	this.rooms = [[new Room()]];

	room = this.rooms[this.room_index_x][this.room_index_y];
	this.checkpoint = {
		x: player.x, y: player.y,
		room_x: this.room_index_x,
		room_y: this.room_index_y,
		facing: player.facing
	};

	this.ChangeRoom();
}

House.prototype.GetRoom = function(){
	if (this.rooms[this.room_index_x] !== undefined)
		return this.rooms[this.room_index_x][this.room_index_y];
	else return undefined;
}

House.prototype.ChangeRoom = function(cx, cy){
	player.pressing_down = false;
	player.pressed_down = false;
	var glitch_type = player.glitch_type;
	var could_use_spellbook = room.can_use_spellbook;

	if (this.GetRoom() === undefined){
        //create new room!!!
        if (this.rooms[this.room_index_x] === undefined)
            this.rooms[this.room_index_x] = {};
        this.rooms[this.room_index_x][this.room_index_y] = new Room();
        //pacman wrap
        //TODO: needs to be fixed to new [x][y] indexing scheme
		/*if (this.rooms[this.room_index_y] !== undefined){
			if (this.room_index_x < 0){
				var room_row = Object.keys(this.rooms[this.room_index_y]);
				this.room_index_x = room_row[room_row.length-1];
			}else
				this.room_index_x = 0;
		}else{
			if (this.room_index_y < 0){
				var room_col = Object.keys(this.rooms);
				this.room_index_y =  room_col[room_col.length-1];
			}else
				this.room_index_y = 0;
		}*/
	}

	if (this.old_room_index_x != this.room_index_x || this.old_room_index_y != this.room_index_y){
		room = this.GetRoom();
		room.index_x = this.room_index_x;
		room.index_y = this.room_index_y;

		room.glitch_type = glitch_type;
		if (!this.has_spellbook || !room.can_use_spellbook){
			room.glitch_index = 0;
			room.glitch_type = room.glitch_sequence[0];
			room.glitch_time = 0;
		}
		for (var i = 0; i < room.entities.length; i++){
			room.entities[i].ResetPosition();
		}
	}
	if (level_edit){
		$("house_coordinates_old").innerHTML = this.old_room_index_x + " " + this.old_room_index_y;
		$("house_coordinates").innerHTML = this.room_index_x + " " + this.room_index_y;
	}
	this.old_room_index_x = this.room_index_x;
	this.old_room_index_y = this.room_index_y;

	room.Speak(null);
	if (!room.can_use_spellbook)
		room.Speak("a dark force prevents\nyou from casting\nspells here");
	//MAKE SURE THE FORM CHANGE REMAINS BETWEEN ROOMS
	if (!could_use_spellbook){
		player.glitch_index = player.inventory.spellbook.spells.length-1;
		Glitch.TransformPlayer(room, Glitch.GREY);
	}else{
        player.MaintainGlitch();
	}
	try{
		eval(room.bg_code);
	}catch(e){
		
	}
	//player.die_to_suffocation = true;

	if (cx < 0)
		player.x = room.MAP_WIDTH * Tile.WIDTH - Tile.WIDTH/2 - player.rb;
	else if (cx > 0)
		player.x = 0 + Tile.WIDTH/2 - player.lb;

	if (cy < 0)
		player.y = room.MAP_HEIGHT * Tile.HEIGHT - Tile.HEIGHT - player.bb;
	else if (cy > 0)
		player.y = 0 + Tile.HEIGHT/2 + player.tb;

	//if (player.x <= 8) player.x+=8;
	//if (player.x >= room.MAP_WIDTH * Tile.WIDTH - 8) player.x -= 8;
}

House.prototype.RevivePlayer = function(){
	this.room_index_x = this.checkpoint.room_x;
	this.room_index_y = this.checkpoint.room_y;
	this.ChangeRoom();
	if (this.checkpoint.id !== undefined){
		for (var i = 0; i < room.entities.length; i++){
			var entity = room.entities[i];
			if (entity instanceof Checkpoint && entity.id === this.checkpoint.id){
				player.x = entity.x;
				player.y = entity.y;
			}
		}
	}else{
		player.x = this.checkpoint.x;
		player.y = this.checkpoint.y;
	}
	player.facing = this.checkpoint.facing;
	player.die_to_suffocation = true;
}

House.prototype.GlitchRevivePlayer = function(){
    this.room_index_x = this.glitched_checkpoint.room_x;
    this.room_index_y = this.glitched_checkpoint.room_y;
    this.ChangeRoom();
    player.x = this.glitched_checkpoint.x;
    player.y = this.glitched_checkpoint.y;
    player.facing = this.glitched_checkpoint.facing;
    player.die_to_suffocation = true;
    Utils.playSound("switchglitch", master_volume, 0);
}

House.prototype.DeactivateCheckpoints = function(){
	var is_glitched = false;
	for (var j in this.rooms){
		for (var i in this.rooms[j]){
			var room = this.rooms[j][i];
			for (var k = 0; k < room.entities.length; k++){
				if (room.entities[k].type === "Checkpoint"){
					if (room.entities[k].is_glitched){
						is_glitched = true;
						continue;
					}
					room.entities[k].Deactivate();
				}
			}
		}
	}
	return !is_glitched;
}

House.prototype.RemoveGlitchedCheckpoint = function(){
	for (var j in this.rooms){
		for (var i in this.rooms[j]){
            var room = this.rooms[j][i];
			for (var k = 0; k < room.entities.length; k++){
				if (room.entities[k] instanceof Checkpoint && room.entities[k].is_glitched){
					room.entities.splice(k, 1);
					k--;
				}
				if (room.entities[k] instanceof Residue){
					room.entities.splice(k, 1);
					k--;
				}
			}
		}
	}

	if (this.new_checkpoint != null){
		this.new_checkpoint = null;
	}
}
