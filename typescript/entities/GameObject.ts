function GameObject(x, y, lb, tb, rb, bb){
	this.type = "GameObject";
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
	this.delete_me = false;
    this.solid = false;

	this.z_index = 0;

	this.kill_player = false;
}

/************************************************************/
GameObject.prototype.Load = function(obj){
    this.Import(obj);
}
GameObject.prototype.Save = function(){
    return this.Export();
}
/************************************************************/
GameObject.prototype.Import = function(obj){
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
GameObject.prototype.Export = function(){
	return {
		x: this.x,
		y: this.y,
		lb: this.lb,
		tb: this.tb,
		rb: this.rb,
		bb: this.bb,
		kill_player: this.kill_player,
        solid: this.solid
	};
}
/************************************************************/
GameObject.prototype.ExportOptions = function(){
	return {};
}
GameObject.prototype.ImportOptions = function(options){}
/************************************************************/

GameObject.prototype.GenerateOptions = function(){
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
GameObject.prototype.ResetPosition = function(){
	this.x = this.original_x;
	this.y = this.original_y;
}
GameObject.prototype.Update = function(map){}
GameObject.prototype.Render = function(ctx, camera){}

GameObject.ZIndexSort = function(a,b){
	return b.z_index - a.z_index;
}

/**************************COLLISION DETECTION*************************************/
//object is of type GameObject
GameObject.prototype.IsColliding = function(object){
	return this.IsRectColliding(object, this.x+this.lb, this.y+this.tb,
		this.x+this.rb, this.y+this.bb);
}

GameObject.prototype.IsRectColliding = function(object, lb,tb,rb,bb){
  if (lb <= object.x + object.rb && rb >= object.x + object.lb &&
      tb <= object.y + object.bb && bb >= object.y + object.tb)
    return true;
  return false;
}

GameObject.prototype.IsPointColliding = function(x, y){
  if (x <= this.x + this.rb && x >= this.x + this.lb &&
      y <= this.y + this.bb && y >= this.y + this.tb)
    return true;
  return false;
}

GameObject.prototype.ReturnCollidingObjects = function(objects){
	var colliding_objects = [];
	for (var i = 0; i < objects.length; i++){
		if (this.IsColliding(objects[i])){
			colliding_objects.push(objects[i]);
		}
	}
	return colliding_objects;
}
