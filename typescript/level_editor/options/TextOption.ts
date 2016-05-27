class TextOption{
    public value: string;
    public dom: HTMLInputElement;

    public constructor(txt){
    	this.value = txt;
    }

    public ExportDom(att_name){
    	var txt = document.createElement("input");
    	txt.value = this.value;
    	this.dom = txt;

    	return txt;
    }

    public UpdateFromDom(){
    	this.value = this.dom.value;
    }
}
