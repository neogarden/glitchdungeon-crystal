function Switcher(x, y){
	GameSprite.call(this, x, y, 4, 5, 12, 16, "obj_sheet");
	this.type = "Switcher";

	this.animation.Change(0, 2, 6);
	this.glitch_type = 0;

	this.z_index = 9;
	this.id = new Date().getTime();
}
extend(GameSprite, Switcher);

Switcher.prototype.Update = function(map){
	GameSprite.prototype.Update.call(this, map);

	if (this.IsColliding(player)){
		if (player.pressed_down && player.pressing_down){
			player.pressed_down = false;
			Utils.playSound("switchglitch", master_volume, 0);
			Glitch.TransformPlayer(room, this.glitch_type, true, false, true);
		}
	}
}

/*---------------------------------------------------------------*/
//              FUNCTIONS TO SAVE/LOAD IN NORMAL GAMEPLAY
//  assumes that appropriate IMPORT function has already been called
Switcher.prototype.Load = function(obj){
		this.glitch_type = obj.glitch_type;
    this.Parent().Load.call(this, obj);
}
Switcher.prototype.Save = function(){
    var obj = this.Parent().Save.call(this);
		obj.glitch_type = this.glitch_type;
    return obj;
}
/*---------------------------------------------------------------*/
//              FUNCTIONS TO IMPORT/EXPORT to save level design to file
//  includes all necessary information to create object from class template
Switcher.prototype.Import = function(obj){
	GameSprite.prototype.Import.call(this, obj);

	this.glitch_type = obj.glitch_type;
}
Switcher.prototype.Export = function(){
	var obj = GameSprite.prototype.Export.call(this);
	obj.glitch_type = this.glitch_type;
	return obj;
}

Switcher.prototype.ImportOptions = function(options){
	this.glitch_type = Number(options.glitch_type.value);
}
Switcher.prototype.ExportOptions = function(){
	var options = {};
	options.glitch_type = new TextDropdown(
			Glitch.GetGlitchTypes(), this.glitch_type
	);
	return options;
}
///////////////////////////////////////////////////////////////////

/*Switcher.prototype.Render = function(ctx, camera){
	ctx.save();

	ctx.clearRect(this.x, this.y, 16, 16);
	GameMover.prototype.Render.call(this, ctx, camera);
	ctx.globalCompositeOperation = "source-in";
	ctx.fillStyle = "#00ff00";
	ctx.fillRect(this.x, this.y, 16, 16);
	ctx.globalCompositeOperation = "source-over";
	ctx.restore();
}*/
