(function(){
	"use strict";
	var
		app = require("http").createServer(handler),
		path = require("path"),
		fs = require("fs"),
		chalk = require("chalk"),
		autoload = require("./lib/autoload"),
		template = require("./lib/template"),
		port = 8080;

		app.listen(port);
		console.log("[" + chalk.green("server") + "] Server started at: " + chalk.magenta("http://localhost:" + port));

		function handler(req, res) {
			var 
				url = req.url,
				ext;

			if(url === "/") url = "/index.html";
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
					fs.readFile(__dirname + url, function(err, data){
						if (err) {
							res.writeHead(404, "not found");
							res.end();
							return;
						}

						res.writeHead(200);
						res.end(data);
					});
				break;
			}
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