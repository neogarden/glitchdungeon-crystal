Room.prototype.Save = function(){
    var entities = [], tiles = [];
	for (var i = 0; i < this.entities.length; i++){
		entities.push({type: this.entities[i].type, obj: this.entities[i].Save()});
	}
    //don't need to 'save' tiles
    //only need to 'save' volatile entities

	return {
        level_id: this.level_id
		,glitch_type: this.glitch_type
		,glitch_sequence: this.glitch_sequence
		,glitch_time_limit: this.glitch_time_limit
		,can_use_spellbook: this.can_use_spellbook
		,entities: entities
		,bg_code: this.bg_code
	};
}
Room.prototype.Load = function(room){
    //load level id
    this.level_id = room.level_id || House.Levels["dungeon"];

	this.glitch_index = 0;
	this.glitch_time = 0;
	this.glitch_time_limit = room.glitch_time_limit || Room.GLITCH_TIME_LIMIT_ORIGINAL;
	this.glitch_sequence = room.glitch_sequence || [room.glitch_type];
	this.glitch_type = this.glitch_sequence[0];
	this.can_use_spellbook = defaultValue(room.can_use_spellbook, true);
	Glitch.TransformPlayer(this, this.glitch_type);

	//load entities
	this.entities = [];
	if (room.entities){
		for (var i = 0; i < room.entities.length; i++){
			var entity = eval("new " + room.entities[i].type + "();");
			entity.Load(room.entities[i].obj);
			this.entities.push(entity);
		}
	}
}

/*******************************************************/
Room.prototype.Export = function(){
	var entities = [], tiles = [];
	for (var i = 0; i < this.entities.length; i++){
		entities.push({type: this.entities[i].type, obj: this.entities[i].Export()});
	}
	for (var i = 0; i < this.tiles.length; i++){
		var row = [];
		for (var j = 0; j < this.tiles[i].length; j++){
			row.push(this.tiles[i][j].Export());
		}
		tiles.push(row);
	}

	return {
        level_id: this.level_id
		,width: this.MAP_WIDTH*Tile.WIDTH
		,height: this.MAP_HEIGHT*Tile.HEIGHT
		,glitch_type: this.glitch_type
		,glitch_sequence: this.glitch_sequence
		,glitch_time_limit: this.glitch_time_limit
		,can_use_spellbook: this.can_use_spellbook
		,entities: entities
		,tiles: tiles
		,bg_code: this.bg_code
		,edge_death: this.edge_death
	};
}

Room.ImportAsync = function(file_name, callback){
	readTextFileAsync(file_name, function(obj_str){
		var room = new Room();
		if (obj_str !== null && obj_str !== ""){
			room.Import(JSON.parse(obj_str));
		}
		callback(room);
	});
}

Room.Import = function(file_name){
	var room = new Room();
	var obj_str = readTextFile(file_name);
	if (obj_str !== null && obj_str !== ""){
		room.Import(JSON.parse(obj_str));
	}
	return room;
}

Room.prototype.Import = function(room){
    //import level id
    this.level_id = room.level_id || House.Levels["dungeon"];

	this.ChangeSize(room.width, room.height);
	this.glitch_index = 0;
	this.glitch_time = 0;
	this.glitch_time_limit = room.glitch_time_limit || Room.GLITCH_TIME_LIMIT_ORIGINAL;
	this.glitch_sequence = room.glitch_sequence || [room.glitch_type];
	this.glitch_type = this.glitch_sequence[0];
	this.can_use_spellbook = defaultValue(room.can_use_spellbook, true);
	Glitch.TransformPlayer(this, this.glitch_type);

	//import entities
	this.entities = [];
	if (room.entities){
		for (var i = 0; i < room.entities.length; i++){
			var entity = eval("new " + room.entities[i].type + "();");
			entity.Import(room.entities[i].obj);
			this.entities.push(entity);
		}
	}

	//Import tiles!!!
	this.tiles = [];
	this.MAP_WIDTH = room.tiles[0].length;
	this.MAP_HEIGHT = room.tiles.length;
	for (var i = 0; i < room.tiles.length; i++){
		var row = [];
		for (var j = 0; j < room.tiles[i].length; j++){
			var tile = new Tile(j*Tile.WIDTH, i*Tile.HEIGHT); tile.Import(room.tiles[i][j]);
			row.push(tile);
		}
		this.tiles.push(row);
	}

	this.edge_death = room.edge_death;
	if (this.edge_death === undefined) this.edge_death = false;
	this.bg_code = room.bg_code;
	if (this.bg_code === undefined) this.bg_code = "";
}

/************************EXPORTING AND IMPORTING FUNCTIONS************/
Room.prototype.ImportOptions = function(options){
    this.level_id = Number(options.level_id.value);

	var width = options.width.value;
	width = ~~(width / Tile.WIDTH) * Tile.WIDTH;
	var height = options.height.value;
	height = ~~(height / Tile.HEIGHT) * Tile.HEIGHT;

	this.camera.view_scale = options.view_scale.value;
	this.edge_death = options.edge_death.value;

	this.ChangeSize(width, height);
	this.bg_code = options.bg_code.value;
}
Room.prototype.ExportOptions = function(){
	var options = {};
    options['level_id'] = new TextDropdown(
        House.GetLevels(), this.level_id
    );
	options['width'] = new NumberOption(this.MAP_WIDTH*Tile.WIDTH);
	options['height'] = new NumberOption(this.MAP_HEIGHT*Tile.HEIGHT);
	options['view_scale'] = new NumberOption(this.camera.view_scale);
	options['edge_death'] = new CheckboxOption(this.edge_death);
	options['bg_code'] = new BigTextOption(this.bg_code);
	return options;
}
/********************************************************************/

/////////////////////boilerplate
Room.prototype.GenerateOptions = function(){
	var dom = document.createElement("div");
	var opt = this.ExportOptions();
	for (var attribute in opt){
		var span = document.createElement("span");
		span.innerHTML = attribute;

		var input = opt[attribute].ExportDom(attribute);

		dom.appendChild(span);
		dom.appendChild(document.createElement("br"));
		dom.appendChild(input);
		dom.appendChild(document.createElement("br"));
	}

	var submit = function(){
		for (var attribute in opt){
			opt[attribute].UpdateFromDom();
		}
		this.ImportOptions(opt);
	}.bind(this);

	return { dom: dom, submit: submit };
}
