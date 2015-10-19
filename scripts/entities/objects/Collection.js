function Collection(x, y, collection_id){
	GameSprite.call(this, x, y, 2, 2, 14, 16, "collection_sheet");
	this.type = "Collection";
	this.collection_id = collection_id;
	//this.animation.frame_delay = 30;
	
	var ani_x = Math.floor(this.collection_id / 6) * 2;
	var ani_y = this.collection_id % 6;
	this.animation.Change(ani_x, ani_y, 2);
	
	this.z_index = 8;
}
Collection.prototype.Import = function(obj){
	GameSprite.prototype.Import.call(this, obj);
	this.collection_id = obj.collection_id;
	
	var ani_x = Math.floor(this.collection_id / 6) * 2;
	var ani_y = this.collection_id % 6;
	this.animation.Change(ani_x, ani_y, 2);
}

Collection.prototype.Export = function(){
	var obj = GameSprite.prototype.Export.call(this);
	obj.collection_id = this.collection_id;
	return obj;
}
extend(GameSprite, Collection);

Collection.prototype.Update = function(map){
	if (this.IsColliding(player)){
		this.delete_me = true;
		Utils.playSound("pickup", master_volume, 0);
		room_manager.num_artifacts++;
		room.Speak("item get: "+this.GetName());
		this.GetEvent();
	}
	
	GameSprite.prototype.Update.call(this, map);
}

Collection.prototype.UpdateAnimationFromState = function(){
}

Collection.prototype.GetName = function(){
	switch (this.collection_id){
		case 0: return "grimoire";
		case 1: return "feather spell";
		case 2: return "floor spell";
		case 3: return "gravity spell";
		case 4: return "wall spell";
		case 5: return "invis spell";
		case 6: return "undefined";
		case 7: return "memory spell";
		default: break;
	}
}

Collection.prototype.GetEvent = function(){
	switch (this.collection_id){
		case 0:
			room_manager.has_spellbook = true;
			//var door = room_manager.rooms[4][2].GetDoor(0);
			//door.locked = true;
			//door.room_x = 5;
			//door.room_y = 0;
			//door.num_artifacts = 5;
			room_manager.rooms[4][2].entities.push(new NPC(1*Tile.WIDTH, 7*Tile.HEIGHT, 3));
			room_manager.rooms[4][2].entities.push(new Checkpoint(this.x, this.y));
			room_manager.rooms[4][2].bg_code = "switch (Ǥlitch_type){\n\tcase Ǥlitch.ǤREY:\n\t\tbreak;\n\tcあse Ǥlitch.RED:\n\t\tǤlitch.RedTrあnsform(mあp, mあp.plあyer, normあlize);\n\t\tbreあk;\n\tcase Ǥlitch.ǤREEN:\n\t\tǤlitch.ǤreenTrあnsform(mあp, mあp.player, normあlize);\n\t\tbreあk;\n\tcase Ǥlitch.BLUE:";
			
			bg_name = "lhommeEraseForm";
			if (resource_manager.play_music){
				stopMusic();
				startMusic();
			}
			break;
		case 1:
			if (room_manager.spellbook.indexOf(Glitch.GREEN) < 0)
				room_manager.spellbook.push(Glitch.GREEN);
			break;
		case 2:
			if (room_manager.spellbook.indexOf(Glitch.RED) < 0)
				room_manager.spellbook.push(Glitch.RED);
			break;
		case 3:
			if (room_manager.spellbook.indexOf(Glitch.BLUE) < 0)
				room_manager.spellbook.push(Glitch.BLUE);
			break;
		case 4:
			if (room_manager.spellbook.indexOf(Glitch.GOLD) < 0)
				room_manager.spellbook.push(Glitch.GOLD);
			break;
		case 5:
			if (room_manager.spellbook.indexOf(Glitch.ZERO) < 0)
				room_manager.spellbook.push(Glitch.ZERO);
			break;
		case 6:
			if (!room_manager.beat_game)
				Trophy.GiveTrophy(Trophy.POWERS);
		
			if (room_manager.spellbook.indexOf(Glitch.NEGATIVE) < 0)
				room_manager.spellbook.push(Glitch.NEGATIVE);
			
			player.y = 3*Tile.HEIGHT;
			room.tiles[5][11].collision = Tile.SOLID;
			room.tiles[5][11].tileset_x = 0;
			room.tiles[5][12].collision = Tile.SOLID;
			room.tiles[5][12].tileset_x = 0;
			
			room_manager.SoftImport("glitched", function(){ 
				room = room_manager.GetRoom(); 
				
				for (var i in room_manager.rooms){
					for (var j in room_manager.rooms[i]){
						for (var k = 0; k < room_manager.rooms[i][j].entities.length; k++){
							if (room_manager.rooms[i][j].entities[k].type === "Collection"){
								room_manager.rooms[i][j].entities[k].Update = GameSprite.prototype.Update;
							}
						}
					}
				}
			});

			
			bg_name = "TomWoxom_North";
			if (resource_manager.play_music){
				stopMusic();
				startMusic();
			}
			break;
		case 7:
			Trophy.GiveTrophy(Trophy.SECRET);
		
			//if (room_manager.spellbook.indexOf(Glitch.PINK) < 0)
			//	room_manager.spellbook.push(Glitch.PINK);
			Glitch.PinkTransform();
			room.entities.push(new NPC(4*Tile.WIDTH, 3*Tile.HEIGHT, 21));
			room.entities.push(new NPC(8*Tile.WIDTH, 3*Tile.HEIGHT, 4));
			room.entities.push(new NPC(13*Tile.WIDTH, 3*Tile.HEIGHT, 15));
			
			break;
		default: break;
	}
}