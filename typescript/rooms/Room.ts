class Room{
    public static GLITCH_TIME_LIMIT_ORIGINAL: number = 240;

	public index_x: number = 0;
	public index_y: number = 0;
    public level_id: number = House.Levels["dungeon"];

	public MAP_WIDTH: number = ~~(GAME_WIDTH / (Tile.WIDTH*4));
	public MAP_HEIGHT: number = ~~(GAME_HEIGHT / (Tile.HEIGHT*4));

	public edge_death: boolean = false;

	public paused: boolean = false;

	public glitch_type: number = Glitch.GREY
	public glitch_sequence: number[] = [];
	public glitch_time: number = 0;
	public glitch_index: number = 0;
	public glitch_time_limit: number = Room.GLITCH_TIME_LIMIT_ORIGINAL;
	public can_use_spellbook: boolean = true;

	public bg_code: string = "";

	public spoken_text: string = "";
	public speech_display_arrow: boolean = false;
	public speech_timer: number = 0;
	public speech_time_limit: number = 0;
    public speech_avatar;

	public tilesheet_name: string = "tile_grey_sheet";
	public camera: Camera = new Camera();

    public entities: GameObject[];
    public tiles: Tile[][];

    public constructor(){
        this.CreateEntities();
	    this.InitializeTiles();
    }

    //defined in RoomLoader.ts
    public Save(){}
    public Load(room){}
    public Export(){}
    public Import(room){}
    public static Import(file_name){}
    public static ImportAsync(file_name, callback){}
    public ImportOptions(options){}
    public ExportOptions(){}
    public GenerateOptions(){}

    public GetWidth(){ return this.MAP_WIDTH * Tile.WIDTH; }
    public GetHeight(){ return this.MAP_HEIGHT * Tile.HEIGHT; }

    public CreateEntities(){
    	this.entities = [];
    }

    public GetEntityAtXY(x, y){
    	if (player.IsPointColliding(x, y)) return player;

    	for (var i = 0; i < this.entities.length; i++){
    		var entity = this.entities[i];
    		if (entity.IsPointColliding(x, y)){
    			return entity;
    		}
    	}
    	return undefined;
    }

    public InitializeTiles(){
    	this.tiles = [];
    	for (var i = 0; i < this.MAP_HEIGHT; i++){
    		this.tiles[i] = [];
    		for (var j = 0; j < this.MAP_WIDTH; j++){
    			this.tiles[i].push(new Tile(j * Tile.WIDTH, i * Tile.HEIGHT));
    		}
    	}
    }

    public isValidTile(i, j){
    	return !(i < 0 || i >= this.MAP_HEIGHT || j < 0 || j >= this.MAP_WIDTH);
    }

    public Update(input){
    	input.Update(player);
    	if (this.paused) return;
    	player.Update(this);
    	this.camera.Update(this);

    	for (var i = this.entities.length-1; i >= 0; i--){
    		this.entities[i].Update(this);
    		if (this.entities[i].delete_me) this.entities.splice(i, 1);
    	}

    	this.TryUpdateRoomIfPlayerOffscreen();
    	//this.UpdateGlitchSequence();
    }

    public UpdateGlitchSequence(){
        //UPDATE GLITCH SEQUENCE
    	if (room_manager && !room_manager.has_spellbook || !this.can_use_spellbook){
    		this.glitch_time++;

    		if (this.glitch_sequence.length > 1
    				&& this.glitch_time > this.glitch_time_limit - 60
    				&& this.glitch_time < this.glitch_time_limit)
    		{
    			if ((~~this.glitch_time) % 20 === 0){
    				var temp_index = this.glitch_index;
    				temp_index++;
    				if (temp_index >= this.glitch_sequence.length)
    					temp_index = 0;
    				Glitch.TransformPlayer(this, this.glitch_sequence[temp_index], false, true);
    			}else if (((~~this.glitch_time) - 10) % 20 === 0){
    				Glitch.TransformPlayer(this, this.glitch_sequence[this.glitch_index], false, true);
    			}
    		}

    		if (this.glitch_time >= this.glitch_time_limit){
    			this.glitch_time = 0;

    			this.glitch_index++;
    			if (this.glitch_index >= this.glitch_sequence.length){
    				this.glitch_index = 0;
    			}

    			Glitch.TransformPlayer(this, this.glitch_sequence[this.glitch_index]);
    			this.glitch_type = this.glitch_sequence[this.glitch_index];
    			if (this.glitch_sequence.length > 1){
    				Utils.playSound("switchglitch", master_volume, 0);
    			}
    		}
    	}
    }

    public TryUpdateRoomIfPlayerOffscreen(){
    	var new_coords = [0, 0];

    	//OFFSCREEN TOP
    	if (player.y + player.bb <= 0){
    		new_coords = [0, -1];
    	}
    	//OFFSCREEN BOTTOM
    	else if (player.y + player.tb >= (this.MAP_HEIGHT * Tile.HEIGHT)){
    		new_coords = [0, 1];
    	}

    	//OFFSCREEN LEFT
    	if (player.x <= 0){
    		new_coords = [-1, 0];
    	}
    	//OFFSCREEN RIGHT
    	else if (player.x + Tile.WIDTH >= (this.MAP_WIDTH * Tile.WIDTH)){
    		new_coords = [1, 0];
    	}

    	if (new_coords[0] !== 0 || new_coords[1] !== 0){
    		//!!!
    		if (this.edge_death){
    			player.Die();
    		}else{
    			room_manager.room_index_x += new_coords[0];
    			room_manager.room_index_y += new_coords[1];

    			room_manager.ChangeRoom(new_coords[0], new_coords[1]);
    		}
    	}
    }

    public Speak(text, opts = {}){
    	this.spoken_text = text;
    	this.speech_timer = 0;
    	this.speech_time_limit = opts['speech_time'] || 240;
    	this.speech_display_arrow = opts['display_arrow'] || false;
    	this.speech_avatar = opts['avatar'] || null;
    }

    public RenderSpeech(ctx){
    	var speech_height = 32;

    	if (this.spoken_text != null && this.spoken_text.length > 0){
    		this.speech_timer++;
    		if (this.speech_timer > this.speech_time_limit){
    			this.speech_timer = 0;
    			this.Speak(null);
    			return;
    		}

    		GAME_HEIGHT /= 4;
    		GAME_WIDTH /= 4;

    		var h = 0;
    		if (player.y+(player.bb/2) >= GAME_HEIGHT/2)
    			h = (-1)*(GAME_HEIGHT/1.5)+Tile.HEIGHT-8;
            h += GAME_HEIGHT-(Tile.HEIGHT)-speech_height;

    		//RENDER THE SPEECH BOX
    		ctx.fillStyle = "#ffffff";
    		ctx.fillRect(Tile.WIDTH/2, h + (Tile.HEIGHT/2), GAME_WIDTH-(Tile.WIDTH*1), speech_height);
    		ctx.fillStyle = "#000000";
    		ctx.fillRect(Tile.WIDTH/2+2, h + (Tile.HEIGHT/2) + 2, GAME_WIDTH-(Tile.WIDTH*1)-4, speech_height-4);

    		//RENDER THE ACTUAL TEXT
    		var fs = 8;
    		ctx.font = fs + "px pixelFont";
    		ctx.fillStyle = "#ffffff";
    		ctx.strokeStyle = "#ffffff";
    		var texts = this.spoken_text.split("\n");
    		ctx.textAlign="left";
    		for (var i = 0; i < texts.length; i++){
    			if (!(/^((?!chrome).)*safari/i.test(navigator.userAgent))){
    				ctx.fillText(texts[i], Tile.WIDTH*1.5+24, h + (fs*i)+(Tile.HEIGHT/2) + 4);
    			}else if (check_textRenderContext(ctx)){
    				ctx.strokeText(texts[i], Tile.WIDTH*1.5+24, h + (fs*i)+(Tile.HEIGHT/2) - 4, fs-2);
    			}
    		}

    		//RENDER THE SPEAKERS AVATAR IF APPLICABLE
    		if (this.speech_avatar !== null && this.speech_avatar !== undefined){
                var src_rect = this.speech_avatar.src_rect;
    			ctx.drawImage(this.speech_avatar.image,
    				//SOURCE RECTANGLE
    				src_rect[0], src_rect[1], src_rect[2], src_rect[3],
    				//DESTINATION RECTANGLE
    				1, h+3, src_rect[2]*2, src_rect[3]*2
    			);
    		}

    		//RENDER THE "PRESS DOWN TO CONTINUE" NOTIFIER IF APPLICABLE
    		if (this.speech_display_arrow){
    			if (!(/^((?!chrome).)*safari/i.test(navigator.userAgent))){
    				ctx.fillText("(v)", GAME_WIDTH - (Tile.WIDTH*2) - fs, h + (fs*3) - fs, fs*3, fs*3);
    			}else if (check_textRenderContext(ctx)){
    				ctx.strokeText("(v)", GAME_WIDTH - (Tile.WIDTH*2) - fs, h - 8 - fs, fs, fs-2);
    			}
    		}

    		GAME_HEIGHT *= 4;
    		GAME_WIDTH *= 4;
    	}
    }

    public Render(ctx, level_edit){
    	ctx.scale(this.camera.view_scale, this.camera.view_scale);

    	//SORT ENTITIES BY Z INDEX (descending)
    	var entities = this.entities.slice(0);
    	entities.push(player);
    	entities.sort(GameObject.ZIndexSort);
    	var index = 0;

    	//DRAW ENTITIES WITH Z INDEX GREATER THAN 10 UNDER TILES
    	while (entities[index].z_index > 10){
    		entities[index].Render(ctx, this.camera);
    		index++;
    	}

    	//Draw some background code for aesthetic
    	var fs = 4;
    	ctx.font = fs + "px monospace";
    	ctx.fillStyle = "#ffffff";
    	ctx.strokeStyle = "#ffffff";
    	var texts = this.bg_code.split("\n");
    	if (!(/^((?!chrome).)*safari/i.test(navigator.userAgent))){
    		for (var i = 0; i < texts.length; i++){
    			ctx.fillText(texts[i], 16, fs*i, GAME_WIDTH-32, fs*i);
    		}
    	}else if (check_textRenderContext(ctx)){
    		for (var i = 0; i < texts.length; i++){
    			ctx.strokeText(texts[i], 16, fs*i-8, fs);
    		}
    	}

    	//DRAW THE TILES OF THE ROOM
    	var tile_img = eval("resource_manager." + this.tilesheet_name);
        var p_tile_img = eval("resource_manager." + player.tilesheet_name);
        var left_tile = Math.floor((player.x + player.lb - 32) / Tile.WIDTH);
        var right_tile = Math.ceil((player.x + player.rb + 17) / Tile.WIDTH);
        var top_tile = Math.floor((player.y + player.tb - 32) / Tile.HEIGHT);
        var bottom_tile = Math.ceil((player.y + player.bb + 17) / Tile.HEIGHT);

    	for (var i = 0; i < this.MAP_HEIGHT; i++){ for (var j = 0; j < this.MAP_WIDTH; j++){
            if (i >= top_tile && i <= bottom_tile && j >= left_tile && j <= right_tile)
                this.tiles[i][j].RenderFromImage(ctx, this.camera, p_tile_img);
    		else this.tiles[i][j].RenderFromImage(ctx, this.camera, tile_img);
    	} }

    	//DRAW THE REMAINING ENTITIES
    	for (var i = index; i < entities.length; i++){
    		entities[i].Render(ctx, this.camera);
    	}

    	//coverup
    	this.camera.Render(ctx);
    	this.RenderSpeech(ctx);

    	ctx.scale(1/this.camera.view_scale, 1/this.camera.view_scale);
    }

    /********************OTHER LEVEL EDITING FUNCTIONS********************/
    public ChangeSize(width, height){
    	var old_width = this.MAP_WIDTH;
    	var old_height = this.MAP_HEIGHT;
    	this.MAP_WIDTH = ~~(width / Tile.WIDTH);
    	this.MAP_HEIGHT = ~~(height / Tile.HEIGHT);

    	var temp_tiles = this.tiles;
    	this.InitializeTiles();

    	for (var i = 0; i < this.MAP_HEIGHT; i++){
    		if (i >= old_height) this.tiles[i] = [];
    		for (var j = 0; j < this.MAP_WIDTH; j++){
    			if (i >= old_height)
    				this.tiles[i].push(new Tile(j * Tile.WIDTH, i * Tile.HEIGHT));
    			else if (j >= old_width)
    				this.tiles[i].push(new Tile(j * Tile.WIDTH, i * Tile.HEIGHT));
    			else this.tiles[i][j] = temp_tiles[i][j];
    		}
    	}
    	//console.log("NEW WIDTH: ", this.MAP_WIDTH);
    	//console.log("NEW HEIGHT: ", this.MAP_HEIGHT);
    }

    public GetDoor(door_id, door){
    	for (var i = 0; i < this.entities.length; i++){
    		if (this.entities[i].type === "Door"){
    			if ((<Door>this.entities[i]).door_id == door_id && this.entities[i] !== door)
    				return this.entities[i];
    		}
    	}
    	return null;
    }
}
