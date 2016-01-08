function Residue(x, y, glitched_checkpoint){
	GameSprite.call(this, x, y, 4, 5, 12, 16, "obj_sheet");
	this.type = "Residue";
	
	this.animation.Change(3, 1, 2);
	this.glitched_checkpoint = glitched_checkpoint;
	
	this.z_index = 9;
	this.id = new Date().getTime();
}

Residue.prototype.Update = function(map){
	GameSprite.prototype.Update.call(this, map);
	
	if (this.IsColliding(player)){
		player.touching_checkpoint = true;
		if (player.pressed_down && player.pressing_down){
			player.pressed_down = false;
			Utils.playSound("checkpoint", master_volume, 0);
			this.GlitchRevivePlayer();
		}
	}
}
extend(GameSprite, Residue);

Residue.prototype.Deactivate = function(){
	this.active = false;
	this.animation.Change(this.lex+1, 0, 1);
}

Residue.prototype.GlitchRevivePlayer = function(){
    room_manager.room_index_x = this.glitched_checkpoint.room_x;
    room_manager.room_index_y = this.glitched_checkpoint.room_y;
    room_manager.ChangeRoom();
    player.x = this.glitched_checkpoint.x;
    player.y = this.glitched_checkpoint.y;
    player.facing = this.glitched_checkpoint.facing;
    player.die_to_suffocation = true;
    Utils.playSound("switchglitch", master_volume, 0);
}