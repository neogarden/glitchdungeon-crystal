//http://stackoverflow.com/questions/14446447/javascript-read-local-text-file
function loadExternalFile(file_path, callback){
	var file = new XMLHttpRequest();
	file.open("GET", file_path, true);
	file.onreadystatechange = function(){
		if (file.readyState === 4){
			if (file.status === 200 || file.status == 0){
				var text = file.responseText;
				callback(false, text);
			}else{
				callback("Could not load file: " + file_path);
			}
		}
	}
	file.send(null);
}

function loadExternalScriptsSequentially(file_objects, final_callback){
	var callback = final_callback;
	
	for (var i = file_objects.length-1; i >= 0; i--){		
		callback = function(file_obj, callback, i){
			loadExternalScripts([file_obj], callback);
		}.bind(this, file_objects[i], callback, i);
	}
	callback();
}

//does not error check if script cannot be loaded...

//http://stackoverflow.com/questions/950087/include-a-javascript-file-in-another-javascript-file?rq=1
function loadExternalScripts(file_objects, final_callback){
	var loaded_files = 0;
	
	//http://stackoverflow.com/questions/5999998/how-can-i-check-if-a-javascript-variable-is-function-type
	function isFunction(functionToCheck) {
		var getType = {};
		return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
	}
	
	var head = document.getElementsByTagName('head')[0];
	
	for (var i = 0; i < file_objects.length; i++){
		var file_obj = file_objects[i];
		
		var timeout_id = setTimeout(function(path){
			console.log("could not load file: " + path);
		}.bind(this, file_obj.src ? file_obj.src : file_obj.href), 3000);
		
		var callback = function(timeout_id){
			clearTimeout(timeout_id);
			
			loaded_files++;
			if (loaded_files === file_objects.length && isFunction(final_callback)){
				final_callback();
			}
		}.bind(this, timeout_id);
		
		var tag;
		if (file_obj.src){
			tag = document.createElement('script');
			tag.src = file_obj.src;
			
			var scripts = document.getElementsByTagName("script");
			var should_load = true;
			for (var j = 0; j < scripts.length; j++){
				if (scripts[j].src === tag.src){
					should_load = false;
					break;
				}
			}
			if (!should_load){
				callback();
				continue;
			}
			
			if (typeof(file_obj.type) !== "undefined"){
				tag.type = file_obj.type;
			}
		}
		else if (file_obj.href){
			tag = document.createElement("link");
			tag.href = file_obj.href;
			tag.rel = "stylesheet";
			tag.type = "text/css";
			tag.media = "all";
			
			var links = document.getElementsByTagName("link");
			var should_load = true;
			for (var j = 0; j < links.length; j++){
				if (links[j].src === tag.href){
					should_load = false;
					break;
				}
			}
			if (!should_load){
				callback();
				continue;
			}
		}
		
		if (typeof(file_obj.id) !== "undefined"){
			tag.id = file_obj.id;
		}
		
		//multiple events for cross browser compatibility
		tag.onreadystatechange = callback;
		tag.onload = callback;	
		
		head.appendChild(tag);
	}
}