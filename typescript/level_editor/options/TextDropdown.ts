class TextDropdown{
    public value: string;
    public arr;
    public dom: HTMLSelectElement;

    public constructor(arr, value){
    	this.value = value;
        this.arr = arr;
    }

    public ExportDom(att_name){
    	var select = document.createElement("select");
        for (var i = 0; i < this.arr.length; i++){
            var option = document.createElement("option");
            option.value = this.arr[i].value;
            option.innerHTML = this.arr[i].name;
            select.appendChild(option);
        }
    	this.dom = select;
        this.dom.value = this.value;

    	return select;
    }

    public UpdateFromDom(){
    	this.value = this.dom.options[this.dom.selectedIndex].value;
    }
}
