function CtxMenu(x, y, dom, table, element){
	this.x = x;
	this.y = y;
	
	this.dom = dom;
	this.table = table;
	this.element = element;
	
	this.ele_mousedown_handler = function(e){
		this.Remove();
	}.bind(this);
	this.dom_mousedown_handler = function(e){
		e.stopPropagation();
		e.preventDefault();
	}.bind(this);
	
	this.ele_mouseup_handler = function(e){
	}.bind(this);
	this.dom_mouseup_handler = function(e){
	}.bind(this);
	
	this.ele_contextmenu_handler = function(e){
		this.ShowMe(e);
	}.bind(this);
	this.dom_contextmenu_handler = function(e){
		e.stopPropagation();
		e.preventDefault();
	}.bind(this);
	
	CtxMenu.addEventHandler(this.element, "mousedown", this.ele_mousedown_handler);
	CtxMenu.addEventHandler(this.dom, "mousedown", this.dom_mousedown_handler);
	
	CtxMenu.addEventHandler(this.element, "mouseup", this.ele_mouseup_handler);
	CtxMenu.addEventHandler(this.dom, "mouseup", this.dom_mouseup_handler);
	
	CtxMenu.addEventHandler(this.element, "contextmenu", this.ele_contextmenu_handler);
	CtxMenu.addEventHandler(this.dom, "contextmenu", this.dom_contextmenu_handler);
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

CtxMenu.Init = function(x, y, element){
	var dom = document.getElementById("context_menu");
	var table = document.getElementById("context_menu_table");
	if (dom === undefined || dom === null){
		dom = document.createElement("div");
		dom.id = "context_menu";
		
		table = document.createElement("table");
		table.id = "context_menu_table";
		table.border = 0;
		table.cellpadding = 0;
		table.cellspacing = 0;
		
		dom.appendChild(table);
		document.body.appendChild(dom);
	}
	dom.style.display = "none";
	table.innerHTML = "";
	
	var ctx_menu = new CtxMenu(x, y, dom, table, element);
	return ctx_menu;
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

CtxMenu.prototype.Remove = function(){
	CtxMenu.removeEventHandler(this.element, "mousedown", this.ele_mousedown_handler);
	CtxMenu.removeEventHandler(this.element, "mouseup", this.ele_mouseup_handler);
	CtxMenu.removeEventHandler(this.element, "contextmenu", this.ele_contextmenu_handler);
	
	CtxMenu.removeEventHandler(this.dom, "mousedown", this.dom_mousedown_handler);
	CtxMenu.removeEventHandler(this.dom, "mouseup", this.dom_mouseup_handler);
	CtxMenu.removeEventHandler(this.dom, "contextmenu", this.dom_contextmenu_handler);
	
	try{
		this.HideMe();
	}catch(e){};
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
			this.Remove();
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

CtxMenu.prototype.ShowMe = function(e){
	var x = e.clientX + window.pageXOffset + "px";
	var y = e.clientY + window.pageYOffset + "px";
	
	this.dom.style.display = "inline";
	this.dom.style.position = "absolute";
	this.dom.style.left = x;
	this.dom.style.top = y;
	
	e.preventDefault();
	e.stopPropagation();
}

CtxMenu.prototype.HideMe = function(e){
	this.dom.style.display = "none";
	
	e.preventDefault();
	e.stopPropagation();
}

CtxMenu.prototype.Open = function(){
	var e = this.element.ownerDocument.createEvent('MouseEvents');

	e.initMouseEvent('contextmenu', true, true,
		 this.element.ownerDocument.defaultView, 1, 0, 0, 0, 0, false,
		 false, false, false, 2, null);

	!this.element.dispatchEvent(e);
}