class GameSprite extends GameObject{
    public img_name: string;
    public image: HTMLImageElement;
    public animation: Animation;
    public visible: boolean = true;

    public constructor(x, y, lb, tb, rb, bb, img_name){
    	super(x, y, lb, tb, rb, bb);
    	this.type = "GameSprite";
    	this.img_name = img_name;
    	if (this.img_name != undefined)
    		this.image = eval("resource_manager." + this.img_name);
    	else this.image = null;
    	this.animation = new Animation(1, 8);
    }

    public Import(obj){
        super.Import(obj);
    	this.img_name = obj.img_name;
    	this.image = eval("resource_manager." + this.img_name);
    }

    public Export(): any{
        var obj = super.Export();
        obj.img_name = this.img_name;
        return obj;
    }

    public Update(map){
        this.animation.Update();
        super.Update(map);
    }

    public Render(ctx, camera){
    	if (this.image === null || !this.visible) return;
    	var ani = this.animation;
    	var row = ani.rel_ani_y;
    	var column = ani.rel_ani_x + ani.curr_frame;

    	ctx.drawImage(this.image,
    		//SOURCE RECTANGLE
    		ani.frame_width * column + ani.frame_width * ani.abs_ani_x,
    		ani.frame_height * row + ani.frame_height * ani.abs_ani_y,
    		ani.frame_width, ani.frame_height,
    		//DESTINATION RECTANGLE
    		~~(this.x-camera.x+camera.screen_offset_x+0.5) + ani.x_offset,
    		~~(this.y-camera.y+camera.screen_offset_y+0.5)+ani.y_offset,
    		ani.frame_width, ani.frame_height
    	);
    }
}
