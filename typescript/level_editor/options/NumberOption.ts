class NumberOption{
    public value: string;
    public dom: HTMLInputElement;

    public constructor(num){
    	this.value = num;
    }

    public ExportDom(att_name){
    	var num = <HTMLInputElement>document.createElement("input");
    	num.type = "number";
    	num.value = this.value;
    	this.dom = num;

    	return num;
    }

    public UpdateFromDom(){
    	this.value = this.dom.value;
    }
}
