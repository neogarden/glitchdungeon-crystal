/***********************************************************************/
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
		player = new Player(13, 64);
	
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