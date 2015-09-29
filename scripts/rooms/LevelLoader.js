function LevelLoader(){
}

LevelLoader.Import = function(level_name, canvas, text_canvas, bg_canvas, input, callback_){
	var path = "./level_files/"+level_name+"/";
	
	var loaded = 0;
	var needs_loading = 0;
	var obj = {};
	obj.level_name = level_name;
	
	FileManager.loadFile(path + "etc.json", function(err, json){
		if (err){
			alert("error loading level");
			console.log(err);
			return;
		}
		
		obj.etc = JSON.parse(json);
		needs_loading = obj.etc.room_indices.length;
		
		obj.rooms = [];
		
		for (var i = 0; i < obj.etc.room_indices.length; i++){
			var index = obj.etc.room_indices[i];
			var y = index.y;
			var x = index.x;
			var z = index.z;
			FileManager.loadFile(path + y + "_" + x + "_" + z + ".json", function(y, x, z, error, json){
				if (error){
					alert("error loading level");
					console.log(error);
				}
				
				var room = JSON.parse(json);
				room.y = y;
				room.x = x;
				room.z = z;
				obj.rooms.push(room);
				loaded++;
				if (loaded === needs_loading){
					callback_(Level.Import(obj, canvas, text_canvas, bg_canvas, input));
				}
			}.bind(this, y, x, z));
		}
	});
}

LevelLoader.Export = function(level_name, level, should_alert){
	var path = "./level_files/"+level_name+"/";
	var json = level.Export();
	FileManager.ensureExists(path, function(err){
		try{
			if (!err){
				for (var i = 0; i < json.rooms.length; i++){
					for (var j = 0; j < json.rooms[i].length; j++){
						for (var k = 0; k < json.rooms[i][j].length; k++){
						  var room = json.rooms[i][j][k];
						  var ikey = room.y, jkey = room.x, kkey = room.z;
							FileManager.saveFile(path + ikey + "_" + jkey + "_" + kkey + ".json", JSON.stringify(room));
						}
					}
				}
				FileManager.saveFile(path + "etc.json", json.etc);
				if (should_alert){
					//alert("level saved to file!");
					Dialog.Alert("level saved to file!");
				}
				return;
			}else{
				console.log(err);
			}
		}catch(e){
			console.log(e);
		}
		if (should_alert){
		  Dialog.Alert("error saving level!<br/>(check console for details)");
			//alert("error saving level!");
		}
	});
}