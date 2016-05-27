var TextArrayOption = (function () {
    function TextArrayOption(txtarray, width, height) {
        this.value = txtarray;
        this.width = width;
        this.height = height;
    }
    TextArrayOption.prototype.ExportDom = function (att_name) {
        var value = "";
        for (var i = 0; i < this.value.length; i++) {
            value += this.value[i];
            value += ";\n";
        }
        var txt = document.createElement("textarea");
        txt.style.width = this.width + "px";
        txt.style.height = this.height + "px";
        txt.value = value;
        this.dom = txt;
        return txt;
    };
    TextArrayOption.prototype.UpdateFromDom = function () {
        this.value = [];
        var value = this.dom.value.split(";").map(function (x) { return x.trim(); });
        var offset = 0;
        for (var i = 0; i < value.length; i++) {
            if (value[i].length <= 0 || value[i] === undefined) {
                offset++;
                continue;
            }
            this.value[i - offset] = value[i];
        }
    };
    return TextArrayOption;
}());
