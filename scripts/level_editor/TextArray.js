function TextArray(txtarray){
	this.value = txtarray;
}

TextArray.prototype.ExportDom = function(){
	var div = document.createElement("div");
	for (var i = 0; i < this.value.length; i++){
		var txt = document.createElement("input");
		txt.value = this.value[i];
		div.appendChild(txt);
	}
	
	return div;
}

TextArray.prototype.ImportDom = function(dom){
}