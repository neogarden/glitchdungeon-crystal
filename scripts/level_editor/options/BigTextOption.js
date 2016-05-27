var BigTextOption = (function () {
    function BigTextOption(txt) {
        this.value = txt;
    }
    BigTextOption.prototype.ExportDom = function (att_name) {
        var txt = document.createElement("textarea");
        txt.value = this.value;
        this.dom = txt;
        return txt;
    };
    BigTextOption.prototype.UpdateFromDom = function () {
        this.value = this.dom.value;
    };
    return BigTextOption;
}());
