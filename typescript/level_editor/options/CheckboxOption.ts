class CheckboxOption{
    public value: boolean;
    public dom: HTMLInputElement;
    public constructor(bool){
        this.value = bool;
    }

    public ExportDom(){
    	var bool = document.createElement("input");
    	bool.type = "checkbox";
    	bool.checked = this.value;
    	this.dom = bool;

    	return bool;
    }

    public UpdateFromDom(){
    	this.value = this.dom.checked;
    }
}
