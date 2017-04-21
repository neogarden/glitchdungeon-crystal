class NPC extends GameMover{
    public name: string = "NPC";
    public npc_dialog: string[] = ["default"];

    public avatar = null;
    public dialog_image: HTMLImageElement = resource_manager.collection_sheet;
    public dialog_animation: Animation = new Animation(2, 20, 16, 16);
    public dialog_index: number = 0;

    public on_init_event: string = "";
    public on_start_conversation_event: string = "";
    public on_end_conversation_event: string = "";
    public true_on_init_event: string = "";
    public true_start_conversation_event: string = "";
    public true_end_conversation_event: string = "";

    public speaking: boolean = false;

    public constructor(x, y){
    	super(x, y, 2, 2, 14, 16, "npc_sheet");
    	this.type = "NPC";
      this.solid = true;
    	this.animation.frame_delay = 40;
      this.facing = Facing.DOWN;
    }

    public Import(obj){
    	super.Import(obj);
      this.name = obj.name || "NPC";
    	this.npc_dialog = obj.npc_dialog || ["default"];
      this.img_name = obj.img_name || "npc_sheet";
      this.animation.abs_ani_y = obj.abs_ani_y || 0;
    	this.image = eval("resource_manager." + this.img_name);
    	this.on_init_event = obj.on_init_event;
      this.on_start_conversation_event = obj.on_start_conversation_event;
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
      obj.abs_ani_y = this.animation.abs_ani_y;
    	obj.on_init_event = this.on_init_event;
      obj.on_start_conversation_event = this.on_start_conversation_event;
    	obj.on_end_conversation_event = this.on_end_conversation_event;
    	return obj;
    }
    public ImportOptions(options){
    	this.name = options.name.value;
      this.solid = options.is_solid.value;
    	this.npc_dialog = options.npc_dialog.value;

      this.animation.abs_ani_y = parseInt(options.abs_ani_y.value);
      this.avatar === undefined;
      this.on_init_event = options.on_init_event.value;
      this.on_start_conversation_event = options.on_start_conversation_event.value;
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
      options['abs_ani_y'] = new TextOption(this.animation.abs_ani_y);

    	options['on_init_event'] = new BigTextOption(this.on_init_event);
      options['on_start_conversation_event'] = new BigTextOption(this.on_start_conversation_event);
    	options['on_end_conversation_event'] = new BigTextOption(this.on_end_conversation_event);

    	return options;
    }

    public Update(map){
    	super.Update(map);
      this.dialog_animation.Update();

      if (!this.speaking) {
        this.TryToStartConversation();
      } else if (this.speaking) {
        this.Converse();
      }
    }

    private TryToStartConversation() {
      //If i'm touching the player and the player presses down, speak!
      if (this.IsRectColliding(player,
          this.x+this.lb-Tile.WIDTH, this.y+this.tb-Tile.WIDTH/2,
          this.x+this.rb+Tile.WIDTH, this.y+this.bb+Tile.WIDTH/2)){

          this.UpdateFacing_();

          if (player.isExamining()){
            Utils.playSound("locked", master_volume, 0);
            try {
              eval(this.on_start_conversation_event);
            } catch(e) {
              console.log(e);
            }
            player.speaking = true;
            this.speaking = true;
          }
      }
    }

    private UpdateFacing_() {
      if (Math.abs(player.x - this.x) < Math.abs(player.y - this.y)) {
        if (player.y >= this.y) this.facing = Facing.DOWN;
        else this.facing = Facing.UP;
      } else {
        if (player.x >= this.x) this.facing = Facing.RIGHT;
        else this.facing = Facing.LEFT;
      }
    }

    private Converse() {
    	//TALK TO PLAYER AND SUCH
    	if (this.speaking){
    		room.Speak(
    			this.GetText(),
    				{speech_time: 240,
    				 display_arrow: this.npc_dialog.length > 1,
    				 avatar: this.getAvatar()}
    			);

        // The player pressed X again
    		if (player.isExamining()){
    			this.incrementDialog();
    		}
    	}
    }

    public incrementDialog() {
    	this.dialog_index++;
    	if (this.dialog_index >= this.npc_dialog.length) {
    		room.Speak(null, {});
        this.speaking = false;
        player.speaking = false;
        this.dialog_index = 0;

    		try {
    			eval(this.on_end_conversation_event);
    		} catch(e) {
    			console.log(e);
    		}
      } else {
        Utils.playSound("locked", master_volume, 0);
      }
    }

    public getAvatar(){
      var facing = this.facing;
      this.facing = Facing.DOWN;
      this.UpdateAnimationFromState();
    	if (this.avatar === undefined || this.avatar === null){
    		var ani = this.animation;
    		this.avatar = {
    			image: this.image,
    			src_rect: [
    				ani.abs_ani_x * ani.frame_width,
    				ani.abs_ani_y * ani.frame_height,
    				ani.frame_width,
    				ani.frame_height - 2,
    			]
    		}
    	}
      this.facing = facing;
      this.UpdateAnimationFromState();
    	return this.avatar;
    }

    //TEXT BABY
    public GetText(): string{
    	if (this.npc_dialog && this.npc_dialog.length > 0) {
    		return this.npc_dialog[this.dialog_index];
      }
      else return "...";
    }

    public UpdateAnimationFromState(){
      // let Facing.DOWN be default ani_y = 0, ani_x = 0;
      let ani_x = 0;
      let ani_y = 0;
      if (this.facing == Facing.UP) {
        ani_x = 2;
      }
      if (this.facing == Facing.RIGHT) {
        ani_x = 0;
        ani_y = 1;
      }
      if (this.facing == Facing.LEFT) {
        ani_x = 2;
        ani_y = 1;
      }
      this.animation.Change(ani_x, ani_y, 2);

      if (this.speaking) {
        this.animation.frame_delay = 16;
      } else {
        this.animation.frame_delay = 32;
      }
    }
}
