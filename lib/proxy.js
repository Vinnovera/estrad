/**
 * Wrapper for http-proxy
 * 
 * @return new Proxy();
 */
(function(){
	"use strict";

	var
		proxy = require("http-proxy").createProxyServer(),
		fs = require("fs"),
		url = require("url"),
		chalk = require("chalk"),
		helper = require('./helper'),
		hasRoutes = fs.existsSync(helper.cwd('routes.json')),
		routes = (hasRoutes) ? JSON.parse(fs.readFileSync(helper.cwd('routes.json'), 'utf-8')) : {};


	module.exports = new Proxy();

	function Proxy () {

		function getProxyUrl(req, callback) {
			var 
				reqUrl = url.parse(req.url),
				pathname = reqUrl.pathname.replace(/\/+$/, ""),
				key;

			for(key in routes) {
				if(!routes.hasOwnProperty(key)) continue;

				if(key === pathname) {
					return handleMatch(req, reqUrl, routes[key], callback);
				}
			}

			callback(true);
		}

		function handleMatch(req, reqUrl, match, callback) {
			var 
				matchUrl = url.parse(match),
				domain = (matchUrl.host) ? matchUrl.protocol + '//' + matchUrl.host : 'http://' + req.headers.host,
				query = (reqUrl.search) ? reqUrl.search : '',
				target;

			if(!query && matchUrl.search) query = matchUrl.search;

			req.url = matchUrl.pathname + query;
			target = domain + matchUrl.pathname + query;

			callback(null, target);
		}

		function web(req, res, obj) {
			console.log("[" + chalk.green("server") + "] Proxy to: " + chalk.magenta(obj.target));

			proxy.web(req, res, obj);
		}

		return {
			getProxyUrl: getProxyUrl,
			web: web
		};
	}
})();