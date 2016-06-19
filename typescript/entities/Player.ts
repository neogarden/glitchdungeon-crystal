class Player extends GameMover{
    public touching_door: boolean = false;
    public touching_checkpoint: boolean = false;
    public speaking: boolean = false;
    public num_deaths: number = 0;
    public spells_cast: number = 0;
    public is_moving_to_spot: boolean = false;
    public spot_to_move_to: Point = new Point(0, 0);
    public inventory: Object;

    public glitch_type: number = Glitch.GREY;
    public glitch_index: number = -1;
    public tilesheet_name: string;

    public constructor(x, y){
        super(x, y, 2, 2, 14, 16, "player_grey_sheet");
    	this.type = "Player";
    	this.animation.frame_height = 16;

        //INVENTORY
    	this.inventory = {
            spellbook: {
                active: false,
                level: 0,
                spells: []
            },
            artifacts: []
        };

    	this.z_index = -100;
    }

    public Load(obj){
        super.Load(obj);

        this.inventory = obj.inventory;
        this.glitch_type = obj.glitch_type;
        this.glitch_index = obj.glitch_index;
        this.num_deaths = obj.num_deaths;
        this.spells_cast = obj.spells_cast;
    }
    public Save(){
        var obj = super.Save();
        obj.inventory = this.inventory;
        obj.glitch_type = this.glitch_type;
        obj.glitch_index = this.glitch_index;
        obj.num_deaths = this.num_deaths;
        obj.spells_cast = this.spells_cast;
        return obj;
    }
    public Import(obj){
    	super.Import(obj);
    }
    public Export(){
    	var obj = super.Export();
    	obj.img_name = "player_grey_sheet";
    	return obj;
    }
    /*---------------------------------------------------------------*/

    //inventory and state
    public NumArtifacts(){
        return this.inventory['spellbook'].spells.length;
    }

    public AddSpell(spell){
        var spellbook = this.inventory['spellbook'];
        var level = spellbook.level;

        //spellbook level 0, can only remember one spell at a time
        if (level == 0){
            var prev_spell = null;
            if (spellbook.spells.length >= 1)
                prev_spell = spellbook.spells[0];
            spellbook.spells = [spell];
        }
        //spellbook level 1, can remember more than one spell
        else if (level >= 1){
            if (spellbook.spells.indexOf(spell) < 0)
                spellbook.spells.push(spell);
        }
    }

    public Update(map){
    	this.DieToSpikesAndStuff(map);
    	super.Update(map);
    	this.touching_door = false;
    	this.touching_checkpoint = false;

        if (this.is_moving_to_spot){
            this.spot_to_move_to.x = ~~this.spot_to_move_to.x;
            this.move_state = MoveState.RUNNING;
            this.horizontal_input = true;

            if (this.spot_to_move_to.x + 0.5 < this.x)
                this.x--;
            else if (this.spot_to_move_to.x - 0.5 > this.x)
                this.x++;
            else{
                this.is_moving_to_spot = false;
                this.speaking = false;
                this.move_state = MoveState.STANDING;
                this.horizontal_input = false;
                console.log("DONE!");
            }
            this.x = ~~this.x;
        }
    }

    public MoveToConversationSpot(npc){
        this.vel.x = 0;

        var prev_facing = this.facing;
        this.is_moving_to_spot = true;
        this.spot_to_move_to.y = npc.y;
        if (npc.facing === Facing.LEFT){
            this.spot_to_move_to.x = npc.x + npc.lb - this.rb;
            this.facing = Facing.RIGHT;
        }else{
            this.spot_to_move_to.x = npc.x + npc.rb - this.lb;
            this.facing = Facing.LEFT;
        }
    }

    public PressX(){}

    public MaintainGlitch(){
        var spellbook = this.inventory['spellbook'];
        var level = spellbook.level;
        var tileset = this.tilesheet_name;

        if (level == 0){
            if (this.glitch_index == 0)
                Glitch.TransformPlayer(room, this.glitch_type, true, false, false);
            else
                Glitch.TransformPlayer(room, room.glitch_sequence[0], true, false, true);
        }
        else if (level == 1){
            Glitch.TransformPlayer(room, this.glitch_type, true, false, true);
        }
        this.tilesheet_name = tileset;
    }

    public NextGlitch(){
        var spellbook = this.inventory['spellbook'];
        if (!spellbook.active || spellbook.spells.length == 0)
            return;
    	this.spells_cast++;
    	Utils.playSound("switchglitch", master_volume, 0);

        var level = spellbook.level;

        if (level == 0){
            this.glitch_index++;
            if (this.glitch_index > 1)
                this.glitch_index = 0;
            if (this.glitch_index == 1){
                this.glitch_type = room.glitch_sequence[0];
            }else{
                this.glitch_type = spellbook.spells[0];
            }
        }
        else if (level == 1){
            this.glitch_index++;
            if (this.glitch_index >= this.inventory['spellbook'].spells.length)
                this.glitch_index = 0;

            if (this.glitch_index < 0){
                this.glitch_type = Glitch.GREY;
            }
            if (this.glitch_index >= 0){
                this.glitch_type = this.inventory['spellbook'].spells[this.glitch_index];
                room.glitch_time = 0;
            }
        }

        room.glitch_type = this.glitch_type;
        var spellbook = this.inventory['spellbook'];
        var level = spellbook.level;

        if (level == 0 && this.glitch_index == 0){
            Glitch.TransformPlayer(room, this.glitch_type, true, false, false);
        }else{
    	       Glitch.TransformPlayer(room, this.glitch_type);
        }
    }

    public PrevGlitch(){
        var spellbook = this.inventory['spellbook'];
        if (!spellbook.active || spellbook.spells.length == 0)
            return;
        var level = spellbook.level;

        if (level == 0){
            this.NextGlitch();
        }
        else if (level == 1){
            this.glitch_index-=2;
            if (this.glitch_index < 0)
                this.glitch_index += this.inventory['spellbook'].spells.length;
            this.NextGlitch();
        }
    }

    public DieToSpikesAndStuff(map){
    	var q = 3;
    	var x = this.x;
    	var y = this.y;
    	var lb = this.lb;
    	var tb = this.tb;
    	var rb = this.rb;
    	var bb = this.bb;
    	for (var i = 0; i < map.entities.length; i++){
    		if (map.entities[i].kill_player && (this.IsRectColliding(map.entities[i], x+lb+q, y+tb+q,x+rb-q,y+bb-q))){
    			this.Die();
    			return;
    		}
    	}

    	//Colliding with spikes
    	var left_tile = Math.floor((this.x + this.lb + this.vel.x - 1) / Tile.WIDTH);
    	var right_tile = Math.ceil((this.x + this.rb + this.vel.x + 1) / Tile.WIDTH);
    	var top_tile = Math.floor((this.y + this.tb + this.vel.y - 1) / Tile.HEIGHT);
    	var bottom_tile = Math.ceil((this.y + this.bb + this.vel.y + 1) / Tile.HEIGHT);

    	for (var i = top_tile; i <= bottom_tile; i++){
    		for (var j = left_tile; j <= right_tile; j++){
    			if (!map.isValidTile(i, j)) continue;
    			var tile = map.tiles[i][j];
    			if (tile.collision != Tile.KILL_PLAYER && !tile.kill_player) continue;

    			if (this.IsRectColliding(tile, x+lb+q, y+tb+q,x+rb-q,y+bb-q)){
    				this.Die();
    				return;
    			}
    		}
    	}
    }

    public Die(){
    	Utils.playSound("hurt", master_volume, 0);
        this.num_deaths++;
    	room_manager.RevivePlayer();
    }

    public Render(ctx, camera){
    	if (this.image === null || !this.visible) return;
    	var ani = this.animation;
    	var row = ani.rel_ani_y;
    	var column = ani.rel_ani_x + ani.curr_frame;

    	ctx.drawImage(this.image,
    		//SOURCE RECTANGLE
    		ani.frame_width * column + ani.abs_ani_x,
    		ani.frame_height * row + ani.abs_ani_y,
    		ani.frame_width, ani.frame_height,
    		//DESTINATION RECTANGLE
    		~~(this.x-camera.x+camera.screen_offset_x+0.5) + ani.x_offset,
    		~~(this.y-camera.y+camera.screen_offset_y+0.5)+ani.y_offset,
    		ani.frame_width, ani.frame_height
    	);

    	var f = -1;
    	if (this.facing === Facing.LEFT) f = 1;

    	//NOW DRAW THE HAT
    	if (!room_manager.beat_game) return;
    	ctx.drawImage(resource_manager.hat_grey_sheet,
    		//SOURCE RECTANGLE
    		ani.frame_width * column + ani.abs_ani_x,
    		ani.frame_height * row + ani.abs_ani_y,
    		ani.frame_width, ani.frame_height,
    		//DESTINATION RECTANGLE
    		~~(this.x-camera.x+camera.screen_offset_x+0.5) + ani.x_offset + f,
    		~~(this.y-camera.y+camera.screen_offset_y+0.5)+ani.y_offset - 6,
    		ani.frame_width, ani.frame_height
    	);
    }
}
