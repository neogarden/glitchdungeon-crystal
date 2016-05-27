class Checkpoint extends GameSprite{
    public active: boolean = false;
    public lex: number = 1;
    public id: number = new Date().getTime();
    public is_glitched: boolean = false;

    public constructor(x, y){
        super(x, y, 4, 5, 12, 16, "obj_sheet");
    	this.type = "Checkpoint";

    	this.animation.Change(2, 0, 1);

    	this.z_index = 9;
    }

    public Import(obj){
        super.Import(obj);
        this.id = obj.id == undefined ? new Date().getTime() : obj.id;
    }

    public Export(){
        var obj = super.Export();
        obj.id = this.id;
        return obj;
    }

    public Update(map){
    	GameSprite.prototype.Update.call(this, map);

    	if (this.IsColliding(player)){
    		player.touching_checkpoint = true;
    		if (!this.active){
                if (this.is_glitched){
                    Utils.playSound("checkpoint", master_volume, 0);
                    this.active = true;
                    this.animation.Change(this.lex, 0, 2);
                    return;
                }
                else{
                    room_manager.DeactivateCheckpoints();
                    room_manager.checkpoint = {
                        id: this.id,
                        x: this.x, y: this.y, //failsafe, unnecessary
                        room_x: room_manager.room_index_x,
                        room_y: room_manager.room_index_y,
                        facing: player.facing
                    }
                    Utils.playSound("checkpoint", master_volume, 0);
                    this.active = true;
                    this.animation.Change(this.lex, 0, 2);
                }
    		}
    	}
    }

    public Deactivate(){
    	this.active = false;
    	this.animation.Change(this.lex+1, 0, 1);
    }
}
