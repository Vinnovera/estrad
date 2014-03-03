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
		routes = JSON.parse(fs.readFileSync(process.cwd() + '/routes.json', 'utf-8'));


	module.exports  = new Proxy();

	function Proxy () {

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

		function web(req, res, obj){
			proxy.web(req, res, obj);
		}

		return {
			getProxyUrl: getProxyUrl,
			web: web
		};
	}
})();