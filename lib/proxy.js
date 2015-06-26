/**
 * Wrapper for http-proxy
 * 
 * @return new Proxy();
 */
(function(){
	"use strict";

	var
		proxy     = require("http-proxy").createProxyServer(),
		fs        = require("fs"),
		url       = require("url"),
		chalk     = require("chalk"),
		helper    = require('./helper'),
		path      = require('path'),
		hasRoutes = fs.existsSync(helper.cwd('routes.json')),
		routes    = (hasRoutes) ? JSON.parse(fs.readFileSync(helper.cwd('routes.json'), 'utf-8')) : {};

	module.exports = new Proxy();

	function Proxy () {
		// Cached regular expressions for matching named param parts and splatted
		// parts of route strings.
		var 
			splatParam    = /\*/g;

		function getProxyUrl(req, callback) {
			var 
				reqUrl = url.parse(req.url),
				key;

			for(key in routes) {
				if(!routes.hasOwnProperty(key)) continue;

				if(routeToRegExp(key).test(reqUrl.pathname)) {
					return handleMatch(key, reqUrl, routes[key], function(err, reqUrl, target) {

						if(err) return callback(err);

						req.url = reqUrl;
						callback(null, target);
					});
				}
			}

			callback(true);
		}

		function handleMatch(key, reqUrl, match, callback) {
			var 
				matchUrl = url.parse(match),
				domain   = (matchUrl.host) ? matchUrl.protocol + '//' + matchUrl.host : 'http://' + reqUrl.host,
				query    = (reqUrl.search) ? reqUrl.search : '',
				rex      = routeToRegExp(key),
				rexMatch = reqUrl.pathname.match(rex),
				newUrl;

			/**
			 * Build new target URL
			 */

			// Keep query params
			if(!query && matchUrl.search) query = matchUrl.search;

			newUrl = matchUrl.pathname;

			// Handle wildcard
			if(rexMatch && rexMatch[1]) {
				newUrl += rexMatch[1] + getExtensionIfMissing(rexMatch[1], reqUrl.pathname);
			}

			newUrl += query;

			callback(null, newUrl, domain);
		}

		function web(req, res, obj) {
			console.log("[" + chalk.green("server") + "] Proxy to: " + chalk.magenta(obj.target));

			proxy.web(req, res, obj);
		}

		// Convert a route string into a regular expression, suitable for matching
		// against the current location hash.
		function routeToRegExp(route) {
			route = route.replace(splatParam, '([^?]*?)');

			return new RegExp('^' + route + '(?:\\?([\\s\\S]*))?$');
		}

		function getExtensionIfMissing(match, pathname) {
			var 
				matchExt = path.extname(match),
				pathExt  = path.extname(pathname);

			if(!matchExt) {
				return pathExt;
			} else return '';
		}

		return {
			getProxyUrl: getProxyUrl,
			web: web,
			handleMatch: handleMatch
		};
	}
})();