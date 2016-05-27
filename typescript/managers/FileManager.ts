//will exist from socket.io.js in the scripts/lib directory
declare var io:any;

class FileManager{
    public static socket;
    public static port = 8000;

    public static saveFile = function(file_name, file_content, callback = function(){}){
    	try{
    		var fs = require('fs');
    		fs.writeFile(file_name, file_content, function(err){
    			if (err){
    				alert(err);
    			}
    			if (typeof(callback) === "function"){
    				callback();
    			}
    		});
    	}catch(err){
    		//fallback if running without nodejs in dom
    		if (FileManager.socket === undefined){
    		  var url_arr = window.location.href.split(":");
    		  var url = url_arr[0] + ":" + url_arr[1] + ":";
    		  FileManager.socket = io.connect(url+FileManager.port);
    		}
    		FileManager.socket.emit('saveFile', {file_name: file_name, file_content: file_content});
    		FileManager.socket.on('saveFileSuccess', function(data){
    		  FileManager.socket.removeAllListeners("saveFileSuccess");
    		  if (typeof(callback) === "function"){
    		    callback();
    		  }
    		});
    		FileManager.socket.on('saveFileFailure', function(data){
    		  FileManager.socket.removeAllListeners("saveFileFailure");
    		  if (typeof(callback) === "function"){
    		    callback();
    		  }
    		});
    	}
    }

    public static ensureExists = function(path, cb, mask = '0777') {
    	try{
    		var fs = require('fs');
    		fs.mkdir(path, mask, function(err) {
    			if (err) {
    				if (err.code == 'EEXIST') cb(null); // ignore the error if the folder already exists
    				else cb(err); // something else went wrong
    			} else cb(null); // successfully created folder
    		});
    	}catch(err){
    		//fallback if running without nodejs in dom
    		if (FileManager.socket === undefined){
    		  var url_arr = window.location.href.split(":");
    		  var url = url_arr[0] + ":" + url_arr[1] + ":";
    		  FileManager.socket = io.connect(url+FileManager.port);
    		}
    		FileManager.socket.emit('ensureExists', {path: path, mask: mask});
    		FileManager.socket.on("ensureExistsSuccess", function(data){
    		  FileManager.socket.removeAllListeners("ensureExistsSuccess");
    		  cb(null);
    		});
    		FileManager.socket.on("ensureExistsFailure", function(data){
    		  FileManager.socket.removeAllListeners("ensureExistsFailure");

    		  if (data.err.code === "EEXIST"){
    		    cb(null);
    		  }else cb(data.err);
    		});
    	}
    }

    public static loadFile = function(path, callback){
    	try{
    		var fs = require('fs');
    		fs.readFile(path, {encoding: "UTF-8"}, callback);
    	}catch(err){
    		//fallback if running without nodejs in dom
    		loadExternalFile(path, callback);
    	}
    }
}
