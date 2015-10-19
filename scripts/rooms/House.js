function House(){
	this.path = "assets/rooms";
	this.num_deaths = 0;
	this.spells_cast = 0;
	this.then = Date.now();
	this.time = 0;
	this.beat_game = false;
	this.submitted = false;
	player;

	this.num_artifacts = 0;
	this.has_spellbook = false;
	this.spellbook = [];
	this.glitch_type = Glitch.GREY;
	this.glitch_index = -1;

	this.room_index_x = 0;
	this.room_index_y = 0;
}

House.prototype.Export = function(){
  var room_jsons = [];
  var etc = {room_indices: []};
  for (var i in this.rooms){
    var room_row = [];
    for (var j in this.rooms[i]){
      var room = this.rooms[i][j];
      if (room instanceof RoomIllusion) continue;
	  room = room.Export();
      room.index_y = i;
      room.index_x = j;
      
      room_row.push(room);
      etc.room_indices.push({x: j, y: i});
    }
    room_jsons.push(room_row);
  }
  
  return {rooms: room_jsons, etc: JSON.stringify(etc)};
}

House.prototype.SoftImport = function(level_name, callback){
	this.Import(level_name, function(){
		for (var i in this.rooms){
			for (var j in this.rooms[i]){
				old_rooms[i][j] = this.rooms[i][j];
			}
		}
		callback();
	}, false);
}

House.prototype.Import = function(level_name, callback, reset_rooms){
	if (reset_rooms === undefined) reset_rooms = true;
	var path = this.path + "/" + level_name + "/";
	
	var loaded = 0;
	var needs_loading = 0;
	this.level_name = level_name;
	
	if (player === undefined)
		player = new Player(13, 72);
	
	FileManager.loadFile(path + "etc.json", function(err, json){
		if (err){
			alert("error loading level");
			console.log(err);
			return;
		}
		
		this.etc = JSON.parse(json);
		needs_loading = this.etc.room_indices.length;
		
		if (reset_rooms)
			this.rooms = {};
		
		for (var i = 0; i < this.etc.room_indices.length; i++){
			var index = this.etc.room_indices[i];
			var y = index.y;
			var x = index.x;
			FileManager.loadFile(path + x + "_" + y + ".json", function(y, x, error, json){
				if (error){
					alert("error loading level");
					console.log(error);
				}
				
				var room = JSON.parse(json);
				room.y = y;
				room.x = x;
				new_room = new Room();
				new_room.Import(room);
				if (this.rooms[y] === undefined) this.rooms[y] = [];
				this.rooms[y][x] = new_room;
				loaded++;
				if (loaded === needs_loading){
					//FINISHED LOADING ALL THE LEVELS
					var room = this.rooms[this.room_index_y][this.room_index_x];
					this.checkpoint = {
						x: player.x, y: player.y,
						room_x: this.room_index_x,
						room_y: this.room_index_y,
						facing: player.facing
					};
					this.old_checkpoint = null;
					this.new_checkpoint = null;
					
					callback();
				}
			}.bind(this, y, x));
		}
	}.bind(this));
}

House.prototype.Restart = function(){
	this.num_deaths = 0;
	this.spells_cast = 0;
	this.then = Date.now();
	this.time = 0;
	this.submitted = false;
	//this.beat_game = false;

	this.num_artifacts = 0;
	this.has_spellbook = false;
	this.spellbook = [];
	this.glitch_type = Glitch.GREY;
	this.glitch_index = -1;

	this.room_index_x = 0;
	this.room_index_y = 0;
	
	var room = this.rooms[this.room_index_y][this.room_index_x];
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

House.prototype.Reset = function(){
	this.room_index_x = 0;
	this.room_index_y = 0;
	room_manager.rooms = [[new Room()]];
	
	var room = this.rooms[this.room_index_y][this.room_index_x];
	this.checkpoint = {
		x: player.x, y: player.y,
		room_x: this.room_index_x,
		room_y: this.room_index_y,
		facing: player.facing
	};
	
	this.num_artifacts = 0;
	
	this.ChangeRoom();
}

House.prototype.GetRoom = function(){
	if (this.rooms[this.room_index_y] !== undefined)
		return this.rooms[this.room_index_y][this.room_index_x];
	else return undefined;
}

House.prototype.ChangeRoom = function(){
	player.pressing_down = false;
	player.pressed_down = false;
	var glitch_type = this.glitch_type;
	var could_use_spellbook = room.can_use_spellbook;
	
	if (this.GetRoom() === undefined){
		if (this.rooms[this.room_index_y] !== undefined){
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
		}
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
	
	player = player;
	
	room.Speak(null);
	if (!room.can_use_spellbook)
		room.Speak("a dark force prevents\nyou from casting\nspells here");
	//MAKE SURE THE FORM CHANGE REMAINS BETWEEN ROOMS
	if (!could_use_spellbook){
		this.glitch_index = this.spellbook.length-1;
		Glitch.TransformPlayer(room, Glitch.GREY);
	}else{
		Glitch.TransformPlayer(room, room.glitch_type); //this.glitch);
	}
	//player.die_to_suffocation = true;
	
	var temp_bg_name = "Rolemusic_deathOnTheBattlefield";
	if (this.room_index_x === 5 && this.room_index_y === 0 && bg_name !== temp_bg_name){
		bg_name = temp_bg_name;
		if (resource_manager.play_music){
			stopMusic();
			startMusic();
		}
	}
	
	//END CONDITION LOL
	if (this.room_index_x === 5 && this.room_index_y === 5){
		Glitch.TransformPlayer(room, Glitch.GREY);
		this.time = Math.round(((((Date.now() - this.then) / 1000) / 60) + 0.00001) * 100) / 100;
		
		bg_name = "RoccoW_iveGotNothing";
		if (resource_manager.play_music){
			stopMusic();
			startMusic();
		}
		
		room.ChangeSize(320, 120);
		player.x = 16;
	}
}

House.prototype.RandomGlitch = function(){
	if (this.room_index_x === 5 && this.room_index_y === 5) return;
	if (!this.GetRoom().can_use_spellbook){
		Utils.playSound("error", master_volume, 0);
		return;
	}
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
	if (this.glitch_index >= this.spellbook.length)
		this.glitch_index = 0; //-1;
		
	if (this.glitch_index < 0){
		//room.glitch_time = room.glitch_time_limit;
		this.glitch_type = Glitch.GREY;
	}
	if (this.glitch_index >= 0){
		this.glitch_type = this.spellbook[this.glitch_index];
		room.glitch_time = 0;
	}
	
	room.glitch_type = this.glitch_type;
	Glitch.TransformPlayer(room, this.glitch_type);
	
}

House.prototype.RevivePlayer = function(){
	this.num_deaths++;

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
	console.log("num deaths: " + this.num_deaths);
}

House.prototype.DeactivateCheckpoints = function(){
	var is_glitched = false;
	for (var i in this.rooms){
		for (var j in this.rooms[i]){
			var room = this.rooms[i][j];
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
	for (var i in this.rooms){
		for (var j in this.rooms[i]){
			for (var k = 0; k < this.rooms[i][j].entities.length; k++){
				if (this.rooms[i][j].entities[k].type == "Checkpoint" && this.rooms[i][j].entities[k].is_glitched){
					this.rooms[i][j].entities.splice(k, 1);
				}
			}
		}
	}
	
	if (this.new_checkpoint != null){
		this.new_checkpoint = null;
		if (this.old_checkpoint != null){
			var room = this.rooms[this.old_checkpoint.room_y][this.old_checkpoint.room_x];
			for (var i = 0; i < room.entities.length; i++){
				if (room.entities[i].type === "Checkpoint" && !room.entities[i].is_glitched &&
						room.entities[i].x === this.old_checkpoint.x &&
						room.entities[i].y === this.old_checkpoint.y){
					
						this.checkpoint = this.old_checkpoint;
						this.old_checkpoint = null;
						//Utils.playSound("checkpoint", master_volume, 0);
						room.entities[i].active = true;
						room.entities[i].animation.Change(1, 0, 2);
				}
			}
		}
	}
}