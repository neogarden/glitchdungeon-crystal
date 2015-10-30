function CtxMenu(x, y, dom, table, element, parent){
	this.x = x;
	this.y = y;
	
	this.dom = dom;
	
	this.table = table;
	this.element = element;
	this.ctx_parent = parent;
	this.ctx_children = [];
	
	this.ele_mousedown_handler = function(e){
		this.Remove(false);
	}.bind(this);
	this.dom_mousedown_handler = function(e){
		e.cancelBubble = true;
		e.stopPropagation();
		e.preventDefault();
	}.bind(this);
	
	this.ele_mouseup_handler = function(e){
	}.bind(this);
	this.dom_mouseup_handler = function(e){
	}.bind(this);
	
	this.dom_contextmenu_handler = function(e){
		e.cancelBubble = true;
		e.stopPropagation();
		e.preventDefault();
	}.bind(this);
}

CtxMenu.removeEventHandler = function(elem,eventType,handler) {
 if (elem.removeEventListener) 
    elem.removeEventListener (eventType,handler,false);
 if (elem.detachEvent)
    elem.detachEvent ('on'+eventType,handler); 
}
CtxMenu.addEventHandler = function(elem,eventType,handler) {
 if (elem.addEventListener)
     elem.addEventListener (eventType,handler,false);
 else if (elem.attachEvent)
     elem.attachEvent('on'+eventType,handler); 
}

CtxMenu.Init = function(x, y, element, parent){
	var dom = document.createElement("div");
	dom.className = "context_menu";
	
	var table = document.createElement("table");
	table.className = "context_menu_table";
	table.border = 0;
	table.cellpadding = 0;
	table.cellspacing = 0;
	
	dom.appendChild(table);
	dom.style.display = "none";
	table.innerHTML = "";
	
	var ctx_menu = new CtxMenu(x, y, dom, table, element, parent);
	return ctx_menu;
}

CtxMenu.InitNode = function(parent){
	var node = CtxMenu.Init(0, 0, parent.dom, parent);
	return node;
}

CtxMenu.prototype.AddNode = function(label, node){
	if (label === undefined) label = "";
	this.ctx_children.push(node);
	
	var item_row = document.createElement("tr");
	var item_element = document.createElement("td");
	var item = document.createElement("div");
	item.className = "context_menu_item";
	item.innerHTML = label;
	item.onclick = function(e){
		var width = window.getComputedStyle(this.dom, null).getPropertyValue("width");
		width = Number(width.substr(0, width.length-2));
		node.x = (this.x + width);
		node.y = e.clientY;
		node.Open();
	}.bind(this);
	item_element.appendChild(item);
	item_row.appendChild(item_element);
	this.table.appendChild(item);
}

CtxMenu.prototype.MouseDown = function(e){
	alert(e);
	e.preventDefault();
	e.stopPropagation();
}
CtxMenu.prototype.MouseUp = function(e){
}
CtxMenu.prototype.ContextMenu = function(e){
}

CtxMenu.prototype.Remove = function(bubble_up){
	CtxMenu.removeEventHandler(this.element, "mousedown", this.ele_mousedown_handler);
	CtxMenu.removeEventHandler(this.element, "mouseup", this.ele_mouseup_handler);
	CtxMenu.removeEventHandler(this.element, "contextmenu", this.ele_contextmenu_handler);
	
	CtxMenu.removeEventHandler(this.dom, "mousedown", this.dom_mousedown_handler);
	CtxMenu.removeEventHandler(this.dom, "mouseup", this.dom_mouseup_handler);
	CtxMenu.removeEventHandler(this.dom, "contextmenu", this.dom_contextmenu_handler);
	
	if (this.dom.parentNode !== null)
		this.dom.parentNode.removeChild(this.dom);
	
	if (bubble_up === undefined) bubble_up = true;
	
	if (bubble_up && this.ctx_parent !== undefined){
		this.ctx_parent.Remove();
	}
	for (var i = 0; i < this.ctx_children.length; i++){
		this.ctx_children[i].Remove(false);
	}
}

CtxMenu.prototype.AddDivider = function(){
	this.table.appendChild(document.createElement("hr"));
}

CtxMenu.prototype.AddItem = function(label, callback, disabled){
	if (label === undefined) label = "";
	if (callback === undefined) callback = function(){};
	if (disabled === undefined) disabled = false;
	
	var item_row = document.createElement("tr");
	var item_element = document.createElement("td");
	var item = document.createElement("div");
	item.className = "context_menu_item";
	item.innerHTML = label;
	if (disabled){
		item.style.cursor = "";
		item.style.color = "#aaaaaa";
		item.onclick = function(e){
			//this.Remove();
		}.bind(this);
	}else{
		item.onclick = function(e){
			callback();
			this.Remove();
		}.bind(this);
	}
	item_element.appendChild(item);
	item_row.appendChild(item_element);
	this.table.appendChild(item);
}

CtxMenu.prototype.Open = function(){
	CtxMenu.addEventHandler(this.element, "mousedown", this.ele_mousedown_handler);
	CtxMenu.addEventHandler(this.dom, "mousedown", this.dom_mousedown_handler);
	
	CtxMenu.addEventHandler(this.element, "mouseup", this.ele_mouseup_handler);
	CtxMenu.addEventHandler(this.dom, "mouseup", this.dom_mouseup_handler);
	
	CtxMenu.addEventHandler(this.element, "contextmenu", this.ele_contextmenu_handler);
	CtxMenu.addEventHandler(this.dom, "contextmenu", this.dom_contextmenu_handler);
	
	document.body.appendChild(this.dom);
	this.dom.style.display = "inline";
	this.dom.style.position = "absolute";
	this.dom.style.left = this.x + "px";
	this.dom.style.top = this.y + "px";
}