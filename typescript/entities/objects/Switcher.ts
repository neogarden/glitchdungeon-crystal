class Switcher extends GameSprite{
    public glitch_type: number = 0;
    public id: number = new Date().getTime();

    public constructor(x, y){
        super(x, y, 4, 5, 12, 16, "obj_sheet");
    	this.type = "Switcher";

    	this.animation.Change(0, 2, 6);

    	this.z_index = 9;
    }

    public Load(obj){
        super.Load(obj);
    	this.glitch_type = obj.glitch_type;
    }
    public Save(){
        var obj = super.Save();
    	obj.glitch_type = this.glitch_type;
        return obj;
    }
    public Import(obj){
    	GameSprite.prototype.Import.call(this, obj);

    	this.glitch_type = obj.glitch_type;
    }
    public Export(){
    	var obj = GameSprite.prototype.Export.call(this);
    	obj.glitch_type = this.glitch_type;
    	return obj;
    }

    public ImportOptions(options){
    	this.glitch_type = Number(options.glitch_type.value);
    }
    public ExportOptions(){
    	var options = {};
    	options['glitch_type'] = new TextDropdown(
    			Glitch.GetGlitchTypes(), this.glitch_type
    	);
    	return options;
    }

    public Update(map){
    	GameSprite.prototype.Update.call(this, map);

    	if (this.IsColliding(player)){
    		if (player.pressed_down && player.pressing_down){
    			player.pressed_down = false;
    			Utils.playSound("switchglitch", master_volume, 0);
    			Glitch.TransformPlayer(room, this.glitch_type, true, false, true);
    		}
    	}
    }

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

}
