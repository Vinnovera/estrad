(function(){
	"use strict";
	var
		chalk = require("chalk"),
		url = require("url"),
		express = require("express"),
		app = express(),
		proxy = require("./lib/proxy"),
		autoload = require("./lib/autoload"),
		template = require("./lib/template"),
		fsh = require("./lib/filehelper"),
		port = 8080;

	/**
	 * Handle proxy requests
	 */
	app.use(function(req, res, next){
		proxy.getProxyUrl(req, function(err, proxyUrl){
			if(err) return next();

			proxy.web(req, res, {target: proxyUrl});
		});
	});

	/**
	 * Handle requests for HTML files
	 * These files will be templated
	 */
	app.get('/', handler);
	app.get('*.html', handler);

	/**
	 * Handle requests for static files
	 */
	app.use(express.static(__dirname + '/'));

	/**
	 * Accept requests
	 */
	app.listen(port);
	console.log("[" + chalk.green("server") + "] Server started at: " + chalk.magenta("http://localhost:" + port));

	/**
	 * HTML file handler
	 */
	function handler(req, res) {
		var 
			pathname = url.parse(req.url).pathname;

		if(pathname === "/") pathname = "/index.html";

		fsh.fileExists(pathname, function(exists){
			if(!exists) {
				res.writeHead(404, 'Not Found');
				res.end('Not found');
				return;
			}

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