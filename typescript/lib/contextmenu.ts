class CtxMenu{
    public x: number;
    public y: number;
    public dom;
    public table;
    public element;
    public ctx_parent;
    public ctx_children = [];

    public ele_mousedown_handler;
    public dom_mousedown_handler;
    public ele_mouseup_handler;
    public dom_mouseup_handler;
    public ele_contextmenu_handler;
    public dom_contextmenu_handler;

    public constructor(x, y, dom, table, element, parent){
    	this.x = x;
    	this.y = y;

    	this.dom = dom;

    	this.table = table;
    	this.element = element;
    	this.ctx_parent = parent;

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

    public static removeEventHandler(elem,eventType,handler) {
        if (elem.removeEventListener)
            elem.removeEventListener (eventType,handler,false);
        if (elem.detachEvent)
            elem.detachEvent ('on'+eventType,handler);
    }
    public static addEventHandler(elem,eventType,handler) {
        if (elem.addEventListener)
            elem.addEventListener (eventType,handler,false);
        else if (elem.attachEvent)
            elem.attachEvent('on'+eventType,handler);
    }

    public static Init(x, y, element, parent = undefined){
    	var dom = document.createElement("div");
    	dom.className = "context_menu";

    	var table = document.createElement("table");
    	table.className = "context_menu_table";
    	table.border = '0';
    	table['cellpadding'] = '0';
    	table['cellspacing'] = '0';

    	dom.appendChild(table);
    	dom.style.display = "none";
    	table.innerHTML = "";

    	var ctx_menu = new CtxMenu(x, y, dom, table, element, parent);
    	return ctx_menu;
    }

    public static InitNode(parent){
    	var node = CtxMenu.Init(0, 0, parent.dom, parent);
    	return node;
    }

    public AddNode(label, node){
    	if (label === undefined) label = "";
    	this.ctx_children.push(node);

    	var item_row = document.createElement("tr");
    	var item_element = document.createElement("td");
    	var item = document.createElement("div");
    	item.className = "context_menu_item";
    	item.innerHTML = label;
    	item.onmouseover = function(e){
    		var width_str = window.getComputedStyle(this.dom, null).getPropertyValue("width");
    		var width = Number(width_str.substr(0, width_str.length-2));
    		node.x = width - 4;
    		node.y = window.getComputedStyle(item, null).getPropertyValue("y");
    		node.Open(item);
    	}.bind(this);
    	item.onmouseleave = function(e){
    		node.Remove(false);
    	}
    	item_element.appendChild(item);
    	item_row.appendChild(item_element);
    	this.table.appendChild(item);
    }

    public MouseDown(e){
    	alert(e);
    	e.preventDefault();
    	e.stopPropagation();
    }
    public MouseUp(e){}
    public ContextMenu(e){}

    public Remove(bubble_up){
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

    public AddDivider(){
    	this.table.appendChild(document.createElement("hr"));
    }

    public AddItem(label = "", callback = function(){}, disabled = false){
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

    public Open(parent = document.body){
    	CtxMenu.addEventHandler(this.element, "mousedown", this.ele_mousedown_handler);
    	CtxMenu.addEventHandler(this.dom, "mousedown", this.dom_mousedown_handler);

    	CtxMenu.addEventHandler(this.element, "mouseup", this.ele_mouseup_handler);
    	CtxMenu.addEventHandler(this.dom, "mouseup", this.dom_mouseup_handler);

    	CtxMenu.addEventHandler(this.element, "contextmenu", this.ele_contextmenu_handler);
    	CtxMenu.addEventHandler(this.dom, "contextmenu", this.dom_contextmenu_handler);

    	parent.appendChild(this.dom);
    	this.dom.style.display = "inline";
    	this.dom.style.position = "absolute";
    	this.dom.style.left = this.x + "px";
    	this.dom.style.top = this.y + "px";
    }
}
