var TextOption = (function () {
    function TextOption(txt) {
        this.value = txt;
    }
    TextOption.prototype.ExportDom = function (att_name) {
        var txt = document.createElement("input");
        txt.value = this.value;
        this.dom = txt;
        return txt;
    };
    TextOption.prototype.UpdateFromDom = function () {
        this.value = this.dom.value;
    };
    return TextOption;
}());
