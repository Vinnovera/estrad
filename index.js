(function(){
	"use strict";
	var
		app = require("http").createServer(handler),
		//express = require("express"),
		//app = express(),
		proxy = require("http-proxy").createProxyServer(),
		path = require("path"),
		fs = require("fs"),
		chalk = require("chalk"),
		autoload = require("./lib/autoload"),
		template = require("./lib/template"),
		routes = JSON.parse(fs.readFileSync(__dirname + '/routes.json', 'utf-8')),
		port = 8080;

		//app.get('/', handler);
		app.listen(port);
		console.log("[" + chalk.green("server") + "] Server started at: " + chalk.magenta("http://localhost:" + port));

	function handler(req, res) {
		var 
			url = req.url;

		if(url === "/") url = "/index.html";

		fs.exists(__dirname + url, function(exists){
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
						fs.readFile(__dirname + url, function(err, data){
							if (err) throw err;

							res.writeHead(200);
							res.end(data);
						});
					break;
				}
			} else {
				getProxyUrl(req, function(err, proxyUrl){
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

	function getProxyUrl(req, callback) {
		var 
			domain = 'http://' + req.headers.host,
			rex = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(:[0-9]+)?|(?:ww‌​w.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?‌​(?:[\w]*))?)/,
			url = req.url.replace(/\/+$/, ""),
			key,
			target;

		for(key in routes) {
			if(!routes.hasOwnProperty(key)) continue;

			if(key === url) {
				req.url = routes[key];

				if(rex.test(routes[key])) {
					target = routes[key];
				} else {
					target = domain + routes[key];
				}

				return callback(null, target);
			}
		}

		callback(true);
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