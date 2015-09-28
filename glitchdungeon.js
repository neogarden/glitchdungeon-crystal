var port = 8080;

var http = require('http');
var fs = require('fs');
var path = require('path');

// Send index.html to all requests
var app = http.createServer(function(request, response) {
    var filePath = '.' + request.url;
	if (filePath == './')
		filePath = './index.html';
		
	var extname = path.extname(filePath);
	var contentType = 'text/html';
	switch (extname) {
		case '.js':
			contentType = 'text/javascript';
			break;
		case '.css':
			contentType = 'text/css';
			break;
	}
	
	fs.exists(filePath, function(exists) {
		if (exists) {
			fs.readFile(filePath, function(error, content) {
				if (error) {
					console.log("request failed");
					console.log(error);
					response.writeHead(500);
					response.end();
				}
				else {
					response.writeHead(200, { 'Content-Type': contentType });
					response.end(content, 'utf-8');
				}
			});
		}
		else {
			response.writeHead(404);
			response.end();
		}
	});
});

// Socket.io server listens to our app
var io = require('socket.io').listen(app);

// Emit welcome message on connection
io.on('connection', function(socket) {
    socket.on('saveFile', function(data){
      var file_name = data.file_name;
      var file_content = data.file_content;
  		fs.writeFile(file_name, file_content, function(err){
			if (err){
				console.log(err);
				io.sockets.emit("saveFileFailure", {err: err});
			}
			else{
			  console.log("file " +file_name+" saved.");
			  io.sockets.emit("saveFileSuccess", {});
			}
		});
	});
	socket.on("ensureExists", function(data){
	  var path = data.path;
	  var mask = data.mask;

		fs.mkdir(path, mask, function(err){
			if (err){
			  if (err.code !== "EEXIST")
			    console.log(err);
			  io.sockets.emit("ensureExistsFailure", {err: err});
			} else{
			  console.log("file "+path+" exists");
			  io.sockets.emit("ensureExistsSuccess", {});
			}
		});
	});
});

app.listen(port);

console.log("Nodejs http & socket server started at 127.0.0.1:"+port+"...");