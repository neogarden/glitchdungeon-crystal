function NumberOption(num){
	this.value = num;
	this.dom = [];
}

NumberOption.prototype.ExportDom = function(att_name){	
	var num = document.createElement("input");
	num.type = "number";
	num.value = this.value;
	this.dom = num;
	
	return num;
}

NumberOption.prototype.UpdateFromDom = function(){
	this.value = this.dom.value;
}