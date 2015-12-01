function Checkpoint(x, y){
	GameSprite.call(this, x, y, 4, 5, 12, 16, "obj_sheet");
	this.type = "Checkpoint";
	
	this.active = false;
	this.animation.Change(2, 0, 1);
	this.lex = 1;
	
	this.z_index = 9;
	this.id = new Date().getTime();
}
//              FUNCTIONS TO IMPORT/EXPORT to save level design to file
//  includes all necessary information to create object from class template
Checkpoint.prototype.Import = function(obj){
	this.Parent().Import.call(this, obj);
	this.id = obj.id == undefined ? new Date().getTime() : obj.id;
}
Checkpoint.prototype.Export = function(){
	var obj = this.Parent().Export.call(this);
	obj.id = this.id;
	return obj;
}
/////////////////////////////////////////

Checkpoint.prototype.Update = function(map){
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
extend(GameSprite, Checkpoint);

Checkpoint.prototype.Deactivate = function(){
	this.active = false;
	this.animation.Change(this.lex+1, 0, 1);
}