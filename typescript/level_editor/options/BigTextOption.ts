class BigTextOption{
    public value: string;
    public dom: HTMLTextAreaElement;
    public constructor(txt){
        this.value = txt;
    }

    public ExportDom(att_name){
    	var txt = document.createElement("textarea");
    	txt.value = this.value;
    	this.dom = txt;

    	return txt;
    }

    public UpdateFromDom(){
    	this.value = this.dom.value;
    }
}
