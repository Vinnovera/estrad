(function() {
	"use strict";
	var
		chalk = require("chalk"),
		url = require("url"),
		express = require("express"),
		app = express(),
		proxy = require("./lib/proxy"),
		partials = require("estrad-template"),
		extend = require("extend"),
		fs = require("fs"),
		defaultOpt = JSON.parse(fs.readFileSync('./estrad.json')),
		optExists = fs.existsSync(process.cwd() + '/estrad.json'),
		opt = (optExists) ? JSON.parse(fs.readFileSync(process.cwd() + '/estrad.json')) : {}, 
		options = extend(defaultOpt, opt), 
		port = options.server.port;

	/**
	 * Handle proxy requests
	 */
	if(options.server.proxy) {
		app.use(function(req, res, next) {
			proxy.getProxyUrl(req, function(err, proxyUrl) {
				if(err) return next();

				proxy.web(req, res, {target: proxyUrl});
			});
		});
	}

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

		fs.exists(process.cwd() + pathname, function(exists) {
			if(!exists) {
				res.writeHead(404, 'Not Found');
				res.end('Not found');
				return;
			}

			console.log("[" + chalk.green("server") + "] Request: " + chalk.magenta(pathname));

			partials(pathname, options.server.template, function(err, content) {
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
})();