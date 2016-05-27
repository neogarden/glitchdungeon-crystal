var nodejs = (function () {
    function nodejs() {
    }
    nodejs.saveFile = function (file_name, file_content, callback) {
        var fs = require('fs');
        fs.writeFile(file_name, file_content, function (err) {
            if (err) {
                alert(err);
            }
            if (typeof (callback) === "function") {
                callback();
            }
        });
    };
    nodejs.ensureExists = function (path, mask, cb) {
        var fs = require('fs');
        if (typeof mask == 'function') {
            cb = mask;
            mask = '0777';
        }
        fs.mkdir(path, mask, function (err) {
            if (err) {
                if (err.code == 'EEXIST')
                    cb(null);
                else
                    cb(err);
            }
            else
                cb(null);
        });
    };
    nodejs.loadFile = function (file_name, callback) {
        var fs = require('fs');
        fs.readFile(file_name, { encoding: "UTF-8" }, callback);
    };
    return nodejs;
}());
