
//var exec = require("child_process").exec;

var querystring = require('querystring');
var http = require("http");
var path = require("path"); 
var fs = require("fs");     
var url = require("url");

function start(response, postData, getQuery) {
console.log("Request handler 'start' was called.");
var body = '<html>'+
				'<head>'+
				'<meta http-equiv="Content-Type" content="text/html; '+ 'charset=UTF-8" />'+
				'</head>'+
				'<body>'+
				'<form action="/upload?cool=man" method="post">'+
				'<textarea name="text" rows="20" cols="60"></textarea>'+ '<input type="submit" value="Submit text" />'+ '</form>'+
				'</body>'+
		    '</html>';
    response.writeHead(200, {"Content-Type": "text/html"});
    response.write(body);
    response.end();
}



function upload(response, postData, getQuery) {
	console.log("Request handler 'upload' was called."); 
	response.writeHead(200, {"Content-Type": "text/plain"}); 
	response.write("You have sent this : " + querystring.parse(postData).text + "\n ### Get data : " + querystring.parse(getQuery).cool);
	response.end();
}


function handleStaticFiles(response, pathname) {

	var now = new Date();
	var __dirname = "./public";

	pathname = (pathname == "/") ? "/index.html" : pathname ;

	var filename = pathname || "index.html";
	var ext = path.extname(filename);
	var localPath = __dirname;
	var validExtensions = {
		".html" : "text/html",			
		".js": "application/javascript", 
		".css": "text/css",
		".txt": "text/plain",
		".jpg": "image/jpeg",
		".gif": "image/gif",
		".png": "image/png"
	};
	var isValidExt = validExtensions[ext];
 
	if (isValidExt) {
		
		localPath += filename;
		fs.exists(localPath, function(exists) {
			if(exists) {
				console.log("Serving file: " + localPath);
				getFile(localPath, response, isValidExt);
			} else {
				console.log("File not found: " + localPath);
				response.writeHead(404, {"Content-Type": "text/plain"});
	    		response.write("404 File Not found.");
				response.end();
			}
		});
 
	} else {
		console.log("Invalid file extension detected: " + pathname + "cool" + filename);
		response.writeHead(404, {"Content-Type": "text/plain"});
	    response.write("404 File Not found.");
		response.end();
	}

	function getFile(localPath, res, mimeType) {

		  fs.readFile(localPath, 
		  		function(err, contents) {
				    if(!err) {
				      res.setHeader("Content-Length", contents.length);
				      res.setHeader("Content-Type", mimeType);
				      res.statusCode = 200;
				      res.end(contents);
				    } else {
				      res.writeHead(500);
				      res.end();
				    }
				}
		  );
	}
}


exports.start = start;
exports.upload = upload;
exports.handleStaticFiles = handleStaticFiles;