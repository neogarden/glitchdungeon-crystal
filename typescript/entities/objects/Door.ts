class Door extends GameSprite {
    public room_x: number;
    public room_y: number;
    public door_id: number;
    public locked: boolean;
    public num_artifacts: number;
    public talking: boolean = false;

    public constructor(x, y, room_x, room_y, door_id, locked = false, num_artifacts = 0){
    	super(x, y, 4, 4, 12, 16, "obj_sheet");
    	this.type = "Door";

    	this.room_x = room_x;
    	this.room_y = room_y;
    	this.door_id = door_id;

    	this.locked = locked;
    	this.num_artifacts = num_artifacts;

    	this.z_index = 10;
    }

    public Load(obj){
        super.Load(obj);
        this.locked = obj.locked;
    }

    public Save(){
        var obj = super.Save();
        obj.locked = this.locked;
        return obj;
    }

    public Import(obj){
    	super.Import(obj);
    	this.lb = 4;
    	this.rb = 12;
      // TODO(jakeonaut) shouldn't have to do this... Importing old objects overwrites new constants in constructor. Lame
      this.tb = 4;

    	this.room_x = obj.room_x;
    	this.room_y = obj.room_y;
    	this.door_id = obj.door_id;
    	this.locked = obj.locked || false;
    	this.num_artifacts = obj.num_artifacts || 0;

    	this.talking = false;
    }
    public Export(){
    	var obj = super.Export();
    	obj.room_x = this.room_x;
    	obj.room_y = this.room_y;
    	obj.door_id = this.door_id;
    	obj.locked = this.locked;
    	obj.num_artifacts = this.num_artifacts;
    	return obj;
    }
    public ImportOptions(options){
    	this.room_x = Number(options.room_x.value);
    	this.room_y = Number(options.room_y.value);
    	this.door_id = options.door_id.value;
    	this.locked = options.locked.value;
    	this.num_artifacts = Number(options.num_artifacts.value);
    }
    public ExportOptions(){
    	var options = {};
    	options['room_x'] = new NumberOption(this.room_x);
    	options['room_y'] = new NumberOption(this.room_y);
    	options['door_id'] = new TextOption(this.door_id);
    	options['locked'] = new CheckboxOption(this.locked);
    	options['num_artifacts'] = new NumberOption(this.num_artifacts);
    	return options;
    }
    ///////////////////////////////////////////////////////////////////

    public Update(map){
        var _artifacts = player.inventory.artifacts.length;

    	if (this.room_x >= room_manager.house_width || this.room_y >= room_manager.house_height){
    		return;
    	}
    	GameSprite.prototype.Update.call(this, map);

    	var num_needed_artifacts = player.NumArtifacts();

    	if (this.IsColliding(player)){
    		if (player.on_ground){
    			player.touching_door = true;
    			if (player.pressed_down && player.pressing_down){
    				player.pressed_down = false;
    				player.vel.x = 0;

    				if (this.locked){
    					if (_artifacts >= this.num_artifacts){
    						this.locked = false;
    						room.Speak("door unlocked", {});
    						Utils.playSound("LA_Chest_Open", master_volume, 0);
    						this.talking = true;
    					}else{
    						room.Speak("door is locked\nneed " +
                                (this.num_artifacts-_artifacts) + " spells more", {});
    						Utils.playSound("locked", master_volume, 0);
    						this.talking = true;
    					}
    				}
    				else{
    					this.SwitchRooms(map);
    					Utils.playSound("LA_Stairs", master_volume, 0);
    				}
    			}
    		}
    	}
    	else if (this.talking){
    		this.talking = false;
    		room.Speak(null, {});
    	}

    	if (this.locked) this.animation.Change(0, 1, 2);
    	else this.animation.Change(0, 0, 1);
    }

    public SwitchRooms(map){
    	room_manager.room_index_x = this.room_x;
    	room_manager.room_index_y = this.room_y;

    	room_manager.ChangeRoom();

    	console.log("door id: " + this.door_id);
    	var door = room.GetDoor(this.door_id, this);
    	if (door !== null){
    		player.x = door.x;
    		player.y = door.y + door.bb - player.bb;
    		player.facing = player.facing;
    		player.pressing_down = false;
    	}
    }
}
