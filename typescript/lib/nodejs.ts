//will exist if we're running nodejs (by running nodejs run.js to start server)
declare function require(name:string);

class nodejs{
    public static saveFile = function(file_name, file_content, callback){
    	var fs = require('fs');
    	fs.writeFile(file_name, file_content, function(err){
    		if (err){
    			alert(err);
    		}
    		if (typeof(callback) === "function"){
    			callback();
    		}
    	});
    }

    public static ensureExists = function(path, mask, cb) {
    	var fs = require('fs');
        if (typeof mask == 'function') { // allow the `mask` parameter to be optional
            cb = mask;
            mask = '0777';
        }
        fs.mkdir(path, mask, function(err) {
            if (err) {
                if (err.code == 'EEXIST') cb(null); // ignore the error if the folder already exists
                else cb(err); // something else went wrong
            } else cb(null); // successfully created folder
        });
    }

    public static loadFile = function(file_name, callback){
    	var fs = require('fs');
    	fs.readFile(file_name, {encoding: "UTF-8"}, callback);
    }
}
