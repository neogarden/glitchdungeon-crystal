class GameObject{
    public type: string = "GameObject";
    public x: number;
    public y: number;
    public original_x: number;
    public original_y: number;
    public lb: number;
    public rb: number;
    public tb: number;
    public bb: number;
    public width: number;
    public height: number;
    public delete_me: boolean = false;
    public solid: boolean = false;
    public z_index: number = 0;
    public kill_player: boolean = false;

    public constructor(x, y, lb, tb, rb, bb){
    	this.x = x;
    	this.y = y;
    	this.original_x = x;
    	this.original_y = y;
    	this.lb = lb;
    	this.tb = tb;
    	this.rb = rb;
    	this.bb = bb;
    	this.width = rb - lb;
    	this.height = bb - tb;
    }

    /*---------------------------------------------------------------*/
    //              FUNCTIONS TO SAVE/LOAD IN NORMAL GAMEPLAY
    //  assumes that appropriate IMPORT function has already been called
    public Load(obj): void{
        this.Import(obj);
    }

    public Save(){
        return this.Export();
    }

    //functions to IMPORT/EXPORT object configuration from obj (from file)
    public Import(obj): void{
        this.x = obj.x;
    	this.y = obj.y;
    	this.original_x = obj.x;
    	this.original_y = obj.y;
    	this.lb = obj.lb;
    	this.tb = obj.tb;
    	this.rb = obj.rb;
    	this.bb = obj.bb;
    	this.kill_player = obj.kill_player || false;
        this.solid = obj.solid || false;
    }

    public Export(): any{
        return {
            x: this.x,
            y: this.y,
            lb: this.lb,
            tb: this.tb,
            rb: this.rb,
            bb: this.bb,
            kill_player: this.kill_player,
            solid: this.solid
        }
    }

    public ExportOptions(){
        return {};
    }

    public ImportOptions(options){}

    public GenerateOptions(){
        var dom = document.createElement("div");
    	var opt = this.ExportOptions();
    	for (var attribute in opt){
    		var span = document.createElement("span");
    		span.innerHTML = attribute;

    		var input = opt[attribute].ExportDom(attribute);

    		dom.appendChild(span);
    		dom.appendChild(document.createElement("br"));
    		dom.appendChild(input);
    		dom.appendChild(document.createElement("br"));
    	}

    	var submit = function(){
    		for (var attribute in opt){
    			opt[attribute].UpdateFromDom();
    		}
    		this.ImportOptions(opt);
    	}.bind(this);

    	return { dom: dom, submit: submit };
    }

    public ResetPosition(){
        this.x = this.original_x;
        this.y = this.original_y;
    }

    public Update(map){}
    public Render(ctx, camera){}

    public static ZIndexSort(a: GameObject, b: GameObject){
        return b.z_index - a.z_index;
    }

    /**************************COLLISION DETECTION*************************************/
    public IsColliding(object: GameObject){
        return this.IsRectColliding(object, this.x+this.lb, this.y+this.tb,
    		this.x+this.rb, this.y+this.bb);
    }

    public IsRectColliding(object: GameObject, lb,tb,rb,bb){
      if (lb <= object.x + object.rb && rb >= object.x + object.lb &&
          tb <= object.y + object.bb && bb >= object.y + object.tb)
        return true;
      return false;
    }

    public IsPointColliding(x: number, y: number){
        if (x <= this.x + this.rb && x >= this.x + this.lb &&
            y <= this.y + this.bb && y >= this.y + this.tb)
          return true;
        return false;
    }

    public ReturnCollidingObjects(objects: GameObject[]): GameObject[]{
        var colliding_objects: GameObject[] = [];
    	for (var i = 0; i < objects.length; i++){
    		if (this.IsColliding(objects[i])){
    			colliding_objects.push(objects[i]);
    		}
    	}
    	return colliding_objects;
    }
}
