function CheckboxOption(bool){
	this.value = bool;
	this.dom = [];
}

CheckboxOption.prototype.ExportDom = function(){
	var bool = document.createElement("input");
	bool.type = "checkbox";
	bool.checked = this.value;
	this.dom = bool;
	
	return bool;
}

CheckboxOption.prototype.UpdateFromDom = function(){
	this.value = this.dom.checked;
}