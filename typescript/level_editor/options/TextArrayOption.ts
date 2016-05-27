class TextArrayOption{
    public value: string[];
    public width: number;
    public height: number;
    public dom: HTMLTextAreaElement;

    public constructor(txtarray, width, height){
    	this.value = txtarray;
    	this.width = width;
    	this.height = height;
    }

    public ExportDom(att_name){
    	var value = "";
    	for (var i = 0; i < this.value.length; i++){
    		value += this.value[i];
    		value += ";\n";
    	}

    	var txt = <HTMLTextAreaElement>document.createElement("textarea");
    	txt.style.width = this.width + "px";
    	txt.style.height = this.height + "px";
    	txt.value = value;
    	this.dom = txt;

    	return txt;
    }

    public UpdateFromDom(){
    	this.value = [];
    	var value = this.dom.value.split(";").map(x => x.trim());
    	var offset = 0;
    	for (var i = 0; i < value.length; i++){
    		if (value[i].length <= 0 || value[i] === undefined){
    			offset++;
    			continue;
    		}
    		this.value[i-offset] = value[i];
    	}
    }
}
