(function(){
	"use strict";
	var
		app = require("http").createServer(handler),
		path = require("path"),
		chalk = require("chalk"),
		url = require("url"),
		mime = require('mime'),
		proxy = require("./lib/proxy"),
		autoload = require("./lib/autoload"),
		template = require("./lib/template"),
		fsh = require("./lib/filehelper"),
		port = 8080;

	app.listen(port);
	console.log("[" + chalk.green("server") + "] Server started at: " + chalk.magenta("http://localhost:" + port));

	function handler(req, res) {
		var 
			pathname = url.parse(req.url).pathname;

		if(pathname === "/") pathname = "/index.html";

		fsh.fileExists(pathname, function(exists){
			var ext;

			if(exists) {
				ext = path.extname(pathname);

				switch(ext) {
					case ".html":
						console.log("[" + chalk.green("server") + "] Request: " + chalk.magenta(pathname));
						getPage(pathname, function(err, content){
							if(err) {
								res.writeHead(500, "server error");
								res.end();
								console.log("[" + chalk.red("server") + "] " + err);
								return;
							}

							res.writeHead(200, {"Content-Type": "text/html"});
							res.end(content);
						});
					break;
					// Static resourses
					default:
						fsh.fileContents(pathname, function(err, data){
							if (err) throw err;

							res.writeHead(200, {"Content-Type": mime.lookup(pathname)});
							res.end(data);
						});
					break;
				}
			} else {
				proxy.getProxyUrl(req, function(err, proxyUrl){
					if(err) {
						res.writeHead(404);
						res.write("Not Found");
						res.end();
						return;
					}

					proxy.web(req, res, {target: proxyUrl});
				});
			}
		});
	}

	function getPage(page, callback){
		autoload.loadFile(page, function(err, content, obj, dependencies, dependees){

			if(err) return callback(err);

			// Solve dependencies
			template.solveDependencies(obj, dependees, dependencies, function(err, obj){
				var page;
				if(err) return callback(err);

				page = template.interpolate(content, obj);

				callback(null, page);
			});
		});
	}
})();