function LevelEditManager(){
	this.enabled = false;
	this.mouse_down = false;
	this.potential_entity = undefined;
	this.entity = undefined;
	this.entity_grav_acc = 0;
	this.typing = false;
	
	this.ctx_menu_visible = false;
	this.ctx_menu_timer = 0;
	this.ctx_menu_time_limit = 3;
	
	this.offset_x = 0;
	this.offset_y = 0;
	this.tile_mode = false;
	this.tile_img_x = 0;
	this.tile_img_y = 0;
}

LevelEditManager.prototype.Init = function(){
	$("level_edit_buttons").style.display="block";
	
	function keypress(e){
		var code = (e.keyCode ? e.keyCode : e.which);
		if (code == 13) { //Enter keycode
			e.preventDefault();
			ledit_change_room_size();
		}
	}
	$("room_width").onkeypress = keypress;
	$("room_height").onkeypress = keypress;
	this.enabled = true;
	
	var zoom = 2;
	var canvas = $("tileset_canvas");
	var ctx = canvas.getContext("2d");
	ctx.canvas.width = 96*zoom;
	ctx.canvas.height = 96*zoom;
	ctx.scale(zoom, zoom);
	
	canvas.onmousedown = function(e){
		var box = canvas.getBoundingClientRect();
		var x = (e.clientX - box.left) / 2;
		var y = (e.clientY - box.top) / 2;
		var tile_x = Math.floor(x / Tile.WIDTH);
		var tile_y = Math.floor(y / Tile.HEIGHT);
		
		this.setTileImg(tile_x, tile_y);
	}.bind(this);
}

LevelEditManager.prototype.setTileImg = function(tile_x, tile_y){
	var canvas = $("tileset_canvas");
	var ctx = canvas.getContext("2d");
	this.tile_img_x = tile_x;
	this.tile_img_y = tile_y;
	canvas.width = canvas.width;
	var zoom = canvas.width / 96;
	
	
	ctx.fillStyle = "#222222";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	sharpen(ctx);
	ctx.drawImage(resource_manager[room.tilesheet_name], 
		//SOURCE RECTANGLE
		0, 0, 96, 96,
		//DESTINATION RECTANGLE
		0, 0, canvas.width, canvas.height
	);
	ctx.lineWidth = "1";
	ctx.strokeStyle = "#ffffff";
	ctx.rect(tile_x * Tile.WIDTH * zoom, tile_y * Tile.HEIGHT * zoom, Tile.WIDTH * zoom, Tile.HEIGHT * zoom);
	ctx.stroke();
}

LevelEditManager.prototype.Disable = function(){
	$("level_edit_buttons").style.display="none";
	this.enabled = false;
}

LevelEditManager.prototype.CreateContextMenu = function(mouse_x, mouse_y, x, y, tile_x, tile_y){
	var ctx_menu = CtxMenu.Init(mouse_x, mouse_y, document.body);
	ctx_menu.Open();
	this.ctx_menu_visible = true;
	
	//MODE OPTIONS
	ctx_menu.AddItem("toggle tile mode", function(){
		if (Tile.DISPLAY_TYPE === Tile.NORMAL_DISPLAY)
			Tile.DISPLAY_TYPE = Tile.COLLISION_DISPLAY;
		else Tile.DISPLAY_TYPE = Tile.NORMAL_DISPLAY;
	}.bind(this));
	
	ctx_menu.AddDivider();
	
	var entity = room.GetEntityAtXY(x, y);
	var name = "";
	var index = 0;
	if (entity !== undefined){
		name = entity.constructor.name;
		index = room.entities.indexOf(entity);
	}
	
	if (entity !== undefined){
		//EDIT options
		ctx_menu.AddItem("edit " + name, function(){
			room.paused = true;
			var options = this.GenerateOptions();
			level_edit_manager.typing = true;
			Dialog.Confirm("", options.submit, "edit " + name, "edit",
				function(){ room.paused = false; level_edit_manager.typing = false; }
			);
			Dialog.AddElement(options.dom);
		}.bind(entity));

		//DELETE OPTIONS
		ctx_menu.AddItem("delete " + name, function(){
			room.paused = true;
			Dialog.Confirm("are you sure you wish to delete this " + name + "?", function(){ room.entities.splice(index, 1); }, "delete " + name, "delete", function(){ room.paused = false; }
			);
		}.bind(entity));
		
		ctx_menu.AddDivider();
	}
	
	//CREATION OPTIONS
	var create_node = CtxMenu.InitNode(ctx_menu);
    var px = tile_x * Tile.WIDTH-8;
    var py = tile_y * Tile.HEIGHT - 8;
	create_node.AddItem("new NPC", function(){
		room.paused = true;
		var npc = new NPC(px, py);
		var options = npc.GenerateOptions();
		level_edit_manager.typing = true;
		Dialog.Confirm("", function(){
				options.submit();
				room.entities.push(npc);
			},
			"new NPC", "create",
			function(){ 
				room.paused = false; 
				level_edit_manager.typing = false;
			}
		);
		Dialog.AddElement(options.dom);
	}.bind(this));
    
	create_node.AddItem("new Checkpoint", function(){
		var checkpoint = new Checkpoint(px, py);
		room.entities.push(checkpoint);
	}.bind(this));
    
    create_node.AddItem("new Powerup", function(){
        room.paused = true;
        var powerup = new Collection(px, py, 0);
        var options = powerup.GenerateOptions();
        level_edit_manager.typing = true;
        Dialog.Confirm("", function(){
                options.submit();
                room.entities.push(powerup);
            }, "new Powerup", "create",
            function(){
                room.paused = false;
                level_edit_manager.typing = false;
            }
        );
        Dialog.AddElement(options.dom);
    }.bind(this));
    
    create_node.AddItem("new Enemy", function(){
        room.paused = true;
        var enemy = new Enemy(px, py, 0);
        var options = enemy.GenerateOptions();
        level_edit_manager.typing = true;
        Dialog.Confirm("", function(){
                options.submit();
                room.entities.push(enemy);
            }, "new Enemy", "create",
            function(){
                room.paused = false;
                level_edit_manager.typing = false;
            }
        );
        Dialog.AddElement(options.dom);
    }.bind(this));
    
    create_node.AddItem("new Door", function(){
		room.paused = true;
		var door = new Door(px, py, room_manager.room_index_x, room_manager.room_index_y, "id", false, 0);
		var options = door.GenerateOptions();
		level_edit_manager.typing = true;
		Dialog.Confirm("", function(){
				options.submit();
				room.entities.push(door);
			}, "new Door", "create",
			function(){
				room.paused = false;
				level_edit_manager.typing = false;
			}
		);
		Dialog.AddElement(options.dom);
    }.bind(this));
	
	ctx_menu.AddNode("Create new...", create_node);
}

LevelEditManager.prototype.DrawGrid = function(ctx, room){
	return;
	
	var color = "#000000";
	
	var ax = (-room.camera.x + room.camera.screen_offset_x) % Tile.WIDTH;
	var ay = (-room.camera.y + room.camera.screen_offset_y) % Tile.HEIGHT;
	for (var i = 1; i < ~~(GAME_WIDTH/Tile.WIDTH)+1; i++){
		drawLine(ctx, color, ax+ i * Tile.WIDTH, 0, ax + i * Tile.WIDTH, room.SCREEN_HEIGHT, 0.5);
	}
	
	for (var i = 1; i < ~~(GAME_HEIGHT/Tile.HEIGHT)+1; i++){
		drawLine(ctx, color, 0, ay + i * Tile.HEIGHT, room.SCREEN_WIDTH, ay + i * Tile.HEIGHT, 0.5);
	}
}

function TileSetMouseDown(e){
	if(!level_edit) return;
	
	e.preventDefault();
	var box = $("tileset_canvas").getBoundingClientRect();
	var x = (e.clientX - box.left);
	var y = (e.clientY - box.top);
	var tile_x = Math.floor(x / Tile.WIDTH);
	var tile_y = Math.floor(y / Tile.HEIGHT);
	LeditSetTileImage(tile_x, tile_y);
}

function LeditSetTileImage(tile_x, tile_y){
	level_edit_tile_img_x = tile_x;
	level_edit_tile_img_y = tile_y;
	
	level_edit_tileset_ctx.canvas.width = level_edit_tileset_ctx.canvas.width;
	
	level_edit_tileset_ctx.lineWidth="1";
	level_edit_tileset_ctx.strokeStyle = "#ffffff";
	level_edit_tileset_ctx.rect(tile_x * Tile.WIDTH, tile_y * Tile.HEIGHT, Tile.WIDTH, Tile.HEIGHT);
	level_edit_tileset_ctx.stroke();
}

LevelEditManager.prototype.MouseDown = function(e){
	if (!this.enabled) return;
	e.preventDefault();
	level_edit_mouse_down = true;
	
	var right_click = (e.which === 3 && e.button === 2);
	var box = canvas.getBoundingClientRect();
	var x = (e.clientX - box.left) / VIEW_SCALE + room.camera.x - room.camera.screen_offset_x;
	var y = (e.clientY - box.top) / VIEW_SCALE + room.camera.y - room.camera.screen_offset_y;
	var tile_x = Math.floor(x / Tile.WIDTH);
	var tile_y = Math.floor(y / Tile.HEIGHT);

	//NON TILE MODE!!! !ENTITY MODE!!!
	if (!right_click && this.potential_entity !== undefined){
		this.entity = this.potential_entity;
		this.entity_grav_acc = this.entity.grav_acc;
		this.entity.grav_acc = 0;
		potential_level_edit_entity = undefined;
		document.body.style.cursor = "-webkit-grabbing";
		
		this.offset_x = this.entity.x - x;
		this.offset_y = this.entity.y - y;
	}
	
	var timer_callback = function(){};
	
	if (this.potential_entity === undefined){
		timer_callback = function(){
			//TILE MODE!!!
			this.tile_mode = true;
			this.PlaceTile(tile_x, tile_y, right_click);
		}.bind(this);
	}
	
	if (right_click){
		this.ctx_menu_timer = 0;
		this.ctx_menu_timer_id = setInterval(function(){
			this.ctx_menu_timer++;
			if (this.ctx_menu_timer >= this.ctx_menu_time_limit){
				timer_callback();
				clearInterval(this.ctx_menu_timer_id);
				this.ctx_menu_timer_id = undefined;
			}
		}.bind(this), 100);
	}else{
		if (!this.ctx_menu_visible)
			timer_callback();
		this.ctx_menu_visible = false;
	}
}

LevelEditManager.prototype.MouseMove = function(e){
	if (!this.enabled) return;
	if (this.mouse_down && level_edit_object_is_tile){
		this.MouseDown(e);
		return;
	}
	
	var box = canvas.getBoundingClientRect();
	var x = (e.clientX - box.left) / VIEW_SCALE + room.camera.x - room.camera.screen_offset_x;
	var y = (e.clientY - box.top) / VIEW_SCALE + room.camera.y - room.camera.screen_offset_y;
	var tile_x = Math.floor(x / Tile.WIDTH);
	var tile_y = Math.floor(y / Tile.HEIGHT);
	
	if (this.tile_mode){
		this.PlaceTile(tile_x, tile_y, (e.which === 3 && e.button === 2));
	}
	var entity = room.GetEntityAtXY(x, y);
	if (this.entity === undefined){		
		document.body.style.cursor = "auto";
		this.potential_entity = undefined;
		if (entity !== undefined){
			document.body.style.cursor = "-webkit-grab";
			this.potential_entity = entity;
		}
	}else{
		this.entity.x = ~~((x + this.offset_x) / (Tile.WIDTH / 2));
		this.entity.x *= (Tile.WIDTH / 2);
		this.entity.y = ~~((y + this.offset_y) / (Tile.HEIGHT / 2));
		this.entity.y *= (Tile.HEIGHT / 2);
		
		this.entity.original_x = this.entity.x;
		this.entity.original_y = this.entity.y;
	}
}

LevelEditManager.prototype.MouseUp = function(e){
	if (!this.enabled) return;
	this.mouse_down = false;
	this.tile_mode = false;
	var right_click = (e.which === 3 && e.button === 2);
	
	var box = canvas.getBoundingClientRect();
	var mouse_x = e.clientX - box.left;
	var mouse_y = e.clientY - box.top;
	var x = mouse_x / VIEW_SCALE + room.camera.x - room.camera.screen_offset_x;
	var y = mouse_y / VIEW_SCALE + room.camera.y - room.camera.screen_offset_y;
	var tile_x = x / Tile.WIDTH;
	var tile_y = y / Tile.HEIGHT;
	
	if (this.entity !== undefined){
		document.body.cursor = "auto";
		this.entity.grav_acc = this.entity_grav_acc;
		this.entity = undefined;
	}
		
	//right click
	if (right_click && this.ctx_menu_timer < this.ctx_menu_time_limit){
		this.CreateContextMenu(mouse_x, mouse_y, x, y, tile_x, tile_y);
	}
	if (this.ctx_menu_timer_id !== undefined){
		clearInterval(this.ctx_menu_timer_id);
	}
	this.ctx_menu_timer_id = undefined;
}

LevelEditManager.prototype.PlaceTile = function(tile_x, tile_y, right_click){
	var tile = room.tiles[tile_y][tile_x];
	tile.kill_player = false;
	tile.tileset_x = this.tile_img_x;
	tile.tileset_y = this.tile_img_y;
	if (right_click){ //RIGHT CLICK. REMOVE Tile
		tile.collision = Tile.GHOST;
		tile.tileset_x = 0;
		tile.tileset_y = 0;
	}else{
		var collision = document.querySelector('input[name="collision"]:checked').value;
		tile.collision = eval(collision);
	}
}

LevelEditManager.prototype.ChangeRoomSize = function(){
	room.ChangeSize($("room_width").value, $("room_height").value);
}

LevelEditManager.prototype.ChangeGlitch = function(){
	room.glitch_sequence = [eval(ledit_getSelected("glitch_options"))];
	room.glitch_index = 0;
	room.glitch_type = room.glitch_sequence[0];
	Glitch.TransformPlayer(room, room.glitch_type);
}

LevelEditManager.prototype.AddGlitch = function(){
	room.glitch_sequence.push(eval(ledit_getSelected("glitch_options")));
	room.glitch_index = 0;
	room.glitch_time = 0;
}

LevelEditManager.prototype.TrueSave = function(){
	Dialog.Confirm("this will overwrite current main<br/>MAKE SURE EVERYTHING IS OK", function(){
		level_edit_manager.Save('main', true)
	}, "save to main?", "YES, save");
}

LevelEditManager.prototype.Save = function(level_name, should_alert){
  var path = "assets/rooms/"+level_name+"/";
  var json = room_manager.Export();
  FileManager.ensureExists(path, function(err){
    try{
      if (err) console.log(err);
      else{
        for (var i = 0; i < json.rooms.length; i++){
          for (var j = 0; j < json.rooms[i].length; j++){
            var room = json.rooms[i][j];
            var ikey = room.index_y;
            var jkey = room.index_x;
            FileManager.saveFile(path + jkey + "_" + ikey + ".json",
              JSON.stringify(room));
          }
        }
        FileManager.saveFile(path + "etc.json", json.etc);
        if (should_alert) Dialog.Alert("level saved to file!");
        return;
      }
    }catch(e){
      console.log(e);
    }
    if (should_alert){
      Dialog.Alert("error saving level!<br/>(check console for details)");
    }
  });
}

LevelEditManager.prototype.Load = function(){
	var obj_str = $("level_edit_export_text").value;
	try{
		if (obj_str !== null && obj_str !== ""){
			room.Import(JSON.parse(obj_str));
		}
	}catch(e){
		console.log(e);
	}
}

LevelEditManager.prototype.ResetRoom = function(){
	room = new Room();
	$("room_width").value = room.SCREEN_WIDTH;
	$("room_height").value = room.SCREEN_HEIGHT;
}

LevelEditManager.prototype.ResetLevel = function(){
	room_manager.Reset();
}

LevelEditManager.prototype.GetSelected = function(drop_down){
	var e = $(drop_down);
	return e.options[e.selectedIndex].value;
}

function ledit_select(box, obj_type){
	level_edit_mouse_down = false;
	$("tileset_canvas").style.display="none";

	var selected = getElementsByClass("selected_object_box");
	if (selected.length > 0){
		selected[0].className = "object_box";
	}

	box.className = "selected_object_box";
	
	level_edit_object_is_tile = false;
	switch (obj_type){
		case Tile.SOLID:
			level_edit_object_is_tile = true;
			level_edit_object = Tile.SOLID;
			LeditSetTileImage(0, 1);
			break;
		case Tile.SUPER_SOLID:
			level_edit_object_is_tile = true;
			level_edit_object = Tile.SUPER_SOLID;
			LeditSetTileImage(1, 1);
			break;
		case Tile.FALLTHROUGH:
			level_edit_object_is_tile = true;
			level_edit_object = Tile.FALLTHROUGH;
			LeditSetTileImage(2, 1);
			break;
		case Tile.KILL_PLAYER:
			level_edit_object_is_tile = true;
			level_edit_object = Tile.KILL_PLAYER;
			LeditSetTileImage(0, 3);
			break;
		case Tile.GHOST:
			level_edit_object_is_tile = true;
			level_edit_object = Tile.GHOST;
			LeditSetTileImage(0, 0);
			break;
		default:
			level_edit_object = obj_type;
	}
	
	if (level_edit_object_is_tile){
		$("tileset_canvas").style.display="block";
	}
}