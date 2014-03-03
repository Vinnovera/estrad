(function(){
	"use strict";
	var
		app = require("http").createServer(handler),
		path = require("path"),
		chalk = require("chalk"),
		proxy = require("./lib/proxy"),
		autoload = require("./lib/autoload"),
		template = require("./lib/template"),
		fsh = require("./lib/filehelper"),
		port = 8080;

	app.listen(port);
	console.log("[" + chalk.green("server") + "] Server started at: " + chalk.magenta("http://localhost:" + port));

	function handler(req, res) {
		var 
			url = req.url;

		if(url === "/") url = "/index.html";

		fsh.fileExists(url, function(exists){
			var ext;

			if(exists) {
				ext = path.extname(url);

				switch(ext) {
					case ".html":
						console.log("[" + chalk.green("server") + "] Request: " + chalk.magenta(url));
						getPage(url, function(err, content){
							if(err) {
								res.writeHead(500, "server error");
								res.end();
								console.log("[" + chalk.red("server") + "] " + err);
								return;
							}

							res.writeHead(200);
							res.end(content);
						});
					break;
					// Static resourses
					default:
						fsh.fileContents(url, function(err, data){
							if (err) throw err;

							res.writeHead(200);
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