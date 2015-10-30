function BigTextOption(txt){
	this.value = txt;
	this.dom = [];
}

BigTextOption.prototype.ExportDom = function(att_name){	
	var txt = document.createElement("textarea");
	txt.value = this.value;
	this.dom = txt;
	
	return txt;
}

BigTextOption.prototype.UpdateFromDom = function(){
	this.value = this.dom.value;
}