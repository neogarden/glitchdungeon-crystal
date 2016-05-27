House.prototype.SaveToFile = function(){
  var should_alert = true;
  var level_name = "main_save";
  var path = "assets/rooms/"+level_name+"/";
  var json = this.Save();
  FileManager.ensureExists(path, function(err){
    try{
      if (err) console.log(err);
      else{
        for (var j = 0; j < json.rooms.length; j++){
          for (var i = 0; i < json.rooms[j].length; i++){
            var room = json.rooms[j][i];
            var ikey = room.index_y;
            var jkey = room.index_x;
            FileManager.saveFile(path + jkey + "_" + ikey + ".json",
              JSON.stringify(room));
          }
        }
        FileManager.saveFile(path + "player.json", json.player);
        FileManager.saveFile(path + "etc.json", json.etc);
        if (should_alert) Dialog.Alert("game saved!");
        return;
      }
    }catch(e){
      console.log(e);
    }
    if (should_alert){
      Dialog.Alert("error saving game!<br/>(check console for details)");
    }
  });
}

House.prototype.Save = function(){
    var room_jsons = [];
    var etc = {
		checkpoint: this.checkpoint,
		room_indices: [],
	};
	var player_json = JSON.stringify(player.Save());
    for (var j in this.rooms){
        var room_col = [];
        for (var i in this.rooms[j]){
          var room = this.rooms[j][i];
          if (room instanceof RoomIllusion) continue;
          room = room.Save();
          room.index_x = j;
          room.index_y = i;

          room_col.push(room);
          etc.room_indices.push({x: j, y: i});
        }
        room_jsons.push(room_col);
    }

    return {
        player: JSON.stringify(player.Save()),
        rooms: room_jsons,
        etc: JSON.stringify(etc)};
}

House.prototype.Load = function(callback){
	this.LoadName("main_save", callback);
}
House.prototype.LoadName = function(level_name, callback){
	var path = this.path + "/" + level_name + "/";

	var loaded = 0;
	var needs_loading = 0;

	if (player === undefined)
		player = new Player(13, 64);

    FileManager.loadFile(path + "player.json", function(err, json){
        player.Load(JSON.parse(json));
        FileManager.loadFile(path + "etc.json", function(err, json){
            if (err){
                alert("error loading level");
                console.log(err);
                return;
            }

            this.etc = JSON.parse(json);
            needs_loading = this.etc.room_indices.length;

            for (var i = 0; i < this.etc.room_indices.length; i++){
                var index = this.etc.room_indices[i];
                var y = index.y;
                var x = index.x;
                FileManager.loadFile(path + x + "_" + y + ".json", function(x, y, error, json){
                    if (error){
                        alert("error loading level");
                        console.log(error);
                    }

                    var room_save = JSON.parse(json);
                    this.rooms[x][y].Load(room_save);
                    loaded++;
                    if (loaded === needs_loading){
                        //FINISHED LOADING ALL THE LEVELS
                        var room = this.rooms[this.room_index_x][this.room_index_y];
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
                }.bind(this, x, y));
            }
        }.bind(this));
    }.bind(this));
}

/***********************************************************************/
House.prototype.Export = function(){
  var room_jsons = [];
  var etc = {room_indices: []};
  for (var j in this.rooms){
    var room_row = [];
    for (var i in this.rooms[j]){
      var room = this.rooms[j][i];
      if (room instanceof RoomIllusion) continue;
	  room = room.Export();
      room.index_x = j;
      room.index_y = i;

      room_row.push(room);
      etc.room_indices.push({x: j, y: i});
    }
    room_jsons.push(room_row);
  }

  return {rooms: room_jsons, etc: JSON.stringify(etc)};
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

		var etc = JSON.parse(json);
		player.x = etc.player_x || 13;
		player.y = etc.player_y || 64;
		needs_loading = etc.room_indices.length;

		if (reset_rooms)
			this.rooms = {};

		for (var i = 0; i < etc.room_indices.length; i++){
			var index = etc.room_indices[i];
			var y = index.y;
			var x = index.x;
			FileManager.loadFile(path + x + "_" + y + ".json", function(x, y, error, json){
				if (error){
					alert("error loading level");
					console.log(error);
				}

				room = JSON.parse(json);
				room.x = x;
				room.y = y;
				var new_room = new Room();
				new_room.Import(room);
				if (this.rooms[x] === undefined) this.rooms[x] = {};
				this.rooms[x][y] = new_room;
				loaded++;
				if (loaded === needs_loading){
					//FINISHED LOADING ALL THE LEVELS
					var room = this.rooms[this.room_index_x][this.room_index_y];
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
			}.bind(this, x, y));
		}
	}.bind(this));
}
