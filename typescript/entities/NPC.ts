class NPC extends GameMover{
    public name: string = "NPC";
    public npc_dialog: string[] = [];

    public avatar = null;
    public dialog_image: HTMLImageElement = resource_manager.collection_sheet;
    public dialog_animation: Animation = new Animation(2, 20, 16, 16, 6, 3);
    public dialog_index: number = 0;

    public on_init_event: string = "";
    public on_end_conversation_event: string = "";
    public on_begin_conversation_event: string = "";
    public speaking: boolean = false;
    public was_speaking: boolean = false;

    public constructor(x, y){
    	super(x, y, 2, 2, 14, 16, "npc_sheet");
    	this.type = "NPC";
        this.solid = true;
    	this.animation.frame_delay = 40;
    }

    public Import(obj){
    	super.Import(obj);
        this.name = obj.name || "NPC";
    	this.npc_dialog = obj.npc_dialog || [];
        this.img_name = obj.img_name || "npc_sheet";
    	this.image = eval("resource_manager." + this.img_name);
    	this.on_init_event = obj.on_init_event;
    	this.on_end_conversation_event = obj.on_end_conversation_event;

    	try{
    		eval(this.on_init_event);
    	}catch(e){
    		console.log(e);
    	}
    }
    public Export(){
    	var obj = super.Export();
    	obj.name = this.name;
    	obj.npc_dialog = this.npc_dialog;
    	obj.img_name = this.img_name;
    	obj.on_init_event = this.on_init_event;
    	obj.on_end_conversation_event = this.on_end_conversation_event;
    	return obj;
    }
    public ImportOptions(options){
    	this.name = options.name.value;
        this.solid = options.is_solid.value;
    	this.npc_dialog = options.npc_dialog.value;

        this.img_name = options.img_name.value;
    	if (this.img_name != undefined)
    		this.image = eval("resource_manager." + this.img_name);
        this.on_init_event = options.on_init_event.value;
        this.on_end_conversation_event = options.on_end_conversation_event.value;
    }
    public ExportOptions(){
    	var options = {};
    	options['name'] = new TextOption(this.name);
    	var dialog = this.npc_dialog;
    	if (dialog === undefined || dialog.length <= 0)
    		dialog = [this.GetText()];
        options['is_solid'] = new CheckboxOption(this.solid);
    	options['npc_dialog'] = new TextArrayOption(dialog, 210, 69);
        options['img_name ']= new TextDropdown(
            [
                {name: "orange npc", value: "npc_sheet"},
    			{name: "orangenpc lying", value: "npc_fall_sheet"},
                {name: "kid player", value: "player_sheet"},
                {name: "grey player", value: "player_grey_sheet"},
            ],
            this.img_name);

    	options['on_init_event'] = new BigTextOption(this.on_init_event);
    	options['on_end_conversation_event'] = new BigTextOption(this.on_end_conversation_event);

    	return options;
    }

    public Update(map){
    	super.Update(map);
        this.dialog_animation.Update();

    	var d = 16;
    	var dy = 8;
    	var px = player.x + (player.rb/2);
        var midx = this.x + this.rb/2;
    	if (player.y + player.bb > this.y - dy && player.y < this.y + this.bb + dy){
    		if (px < midx && px > this.x + this.lb - d){
    			this.facing = Facing.LEFT;
    		}
    		if (px > midx && px < this.x + this.rb + d){
    			this.facing = Facing.RIGHT;
    		}
    	}

        //If i'm touching the player and the player presses down, speak!
        if (this.IsRectColliding(player,
            this.x+this.lb-Tile.WIDTH, this.y+this.tb-Tile.WIDTH/2,
            this.x+this.rb+Tile.WIDTH, this.y+this.bb+Tile.WIDTH/2)){

            if (player.pressed_down){
                if (!this.speaking){
                    player.MoveToConversationSpot(this);
                }
                this.speaking = true;
                player.speaking = true;
            }
            player.pressed_down = false;
        }else{
            this.speaking = false;
        }

    	//TALK TO PLAYER AND SUCH
    	if (this.speaking){
    		room.Speak(
    			this.GetText(),
    				{speech_time: 240,
    				 display_arrow: this.npc_dialog.length > 1,
    				 avatar: this.getAvatar()}
    			);

    		if (player.pressed_down){
    			this.incrementDialog();
    		}
    	}
    	else if (this.was_speaking){
    		this.was_speaking = false;
    		room.Speak(null, {});

    		try{
    			eval(this.on_end_conversation_event);
    		}catch(e){
    			console.log(e);
    		}
    	}

        this.was_speaking = this.speaking;
    }

    public getAvatar(){
        var facing = this.facing;
        this.facing = Facing.RIGHT;
        this.UpdateAnimationFromState();
    	if (this.avatar === undefined || this.avatar === null){
    		var ani = this.animation;
    		this.avatar = {
    			image: this.image,
    			src_rect: [
    				ani.abs_ani_x,
    				ani.abs_ani_y,
    				ani.frame_width,
    				ani.frame_height - 2,
    			]
    		}
    	}
        this.facing = facing;
        this.UpdateAnimationFromState();
    	return this.avatar;
    }

    public incrementDialog(){
    	if (!this.npc_dialog) return;
    	this.dialog_index++;
    	if (this.dialog_index >= this.npc_dialog.length)
    		this.dialog_index = 0;
    }

    public UpdateAnimationFromState(){
    	var ani_x = 0;//this.npc_id / 2;
    	var ani_y = 0;//this.npc_id % 2;
    	this.animation.Change(ani_x, ani_y, 2);

    	if (this.facing === Facing.LEFT){
    		this.animation.abs_ani_y = 2 * this.animation.frame_height;
    	}else if (this.facing === Facing.RIGHT){
    		this.animation.abs_ani_y = 0;
    	}
    	this.prev_move_state = this.move_state;
    }

    public Render(ctx, camera){
    	if (this.image === null || !this.visible) return;
    	var ani = this.animation;
    	var row = ani.rel_ani_y;
    	var column = ani.rel_ani_x + ani.curr_frame;

        //draw myself
    	ctx.drawImage(this.image,
    		//SOURCE RECTANGLE
    		ani.frame_width * column + ani.abs_ani_x,
    		ani.frame_height * row + ani.abs_ani_y,
    		ani.frame_width,
    		ani.frame_height,
    		//DESTINATION RECTANGLE
    		~~(this.x-camera.x+camera.screen_offset_x+0.5) + ani.x_offset,
    		~~(this.y-camera.y+camera.screen_offset_y+0.5)+ani.y_offset,
    		ani.frame_width,
    		ani.frame_height
    	);

    	var f = -1;
    	if (this.facing === Facing.LEFT) f = 1;
    	var v = -this.animation.curr_frame;

    	//NOW DRAW THE HAT
    	if (room_manager.beat_game){
        	ctx.drawImage(resource_manager.hat_grey_sheet,
        		//SOURCE RECTANGLE
        		ani.frame_width * column + ani.abs_ani_x,
        		ani.frame_height * row + ani.abs_ani_y,
        		ani.frame_width, ani.frame_height,
        		//DESTINATION RECTANGLE
        		~~(this.x-camera.x+camera.screen_offset_x+0.5) + ani.x_offset + f,
        		~~(this.y-camera.y+camera.screen_offset_y+0.5)+ani.y_offset - 7 + v,
        		ani.frame_width, ani.frame_height
        	);
        }
    }

    //TEXT BABY
    public GetText(): string{
    	if (this.npc_dialog && this.npc_dialog.length > 0)
    		return this.npc_dialog[this.dialog_index];
        return "...";
    }
}
