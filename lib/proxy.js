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
		hasRoutes = fs.existsSync(helper.cwd('routes.json')),
		routes    = (hasRoutes) ? JSON.parse(fs.readFileSync(helper.cwd('routes.json'), 'utf-8')) : {};

	module.exports = new Proxy();

	function Proxy () {
		// Cached regular expressions for matching named param parts and splatted
		// parts of route strings.
		var 
			optionalParam = /\((.*?)\)/g,
			namedParam    = /(\(\?)?:\w+/g,
			splatParam    = /\*\w+/g,
			escapeRegExp  = /[\-{}\[\]+?.,\\\^$|#\s]/g;

		function getProxyUrl(req, callback) {
			var 
				reqUrl = url.parse(req.url),
				key;

			for(key in routes) {
				if(!routes.hasOwnProperty(key)) continue;

				if(routeToRegExp(key).test(reqUrl.pathname)) {
					return handleMatch(reqUrl, routes[key], function(err, reqUrl, target) {
						if(err) return callback(err);

						req.url = reqUrl;
						callback(null, target);
					});
				}
			}

			callback(true);
		}

		function handleMatch(reqUrl, match, callback) {
			var 
				matchUrl = url.parse(match),
				domain = (matchUrl.host) ? matchUrl.protocol + '//' + matchUrl.host : 'http://' + reqUrl.host,
				query = (reqUrl.search) ? reqUrl.search : '',
				target;

			if(!query && matchUrl.search) query = matchUrl.search;

			reqUrl = matchUrl.pathname + query;
			target = domain + matchUrl.pathname + query;

			callback(null, reqUrl, target);
		}

		function web(req, res, obj) {
			console.log("[" + chalk.green("server") + "] Proxy to: " + chalk.magenta(obj.target));

			proxy.web(req, res, obj);
		}

		// Convert a route string into a regular expression, suitable for matching
		// against the current location hash.
		function routeToRegExp(route) {
			route = route.replace(escapeRegExp, '\\$&')
				.replace(optionalParam, '(?:$1)?')
				.replace(namedParam, function(match, optional) {
					return optional ? match : '([^/?]+)';
				})
				.replace(splatParam, '([^?]*?)');
			return new RegExp('^' + route + '(?:\\?([\\s\\S]*))?$');
		}

		return {
			getProxyUrl: getProxyUrl,
			web: web,
			handleMatch: handleMatch
		};
	}
})();