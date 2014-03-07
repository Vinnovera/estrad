(function () {
	"use strict";

	var
		autoload = require("./autoload"),
		template = require("./template");

	module.exports = new Partials();

	function Partials() {

		function loadFile(page, callback) {
			autoload.loadFile(page, function(){
				var args = Array.prototype.slice.call(arguments);

				args.push(callback);

				solveDependencies.apply(this, args);
			});
		}

		function getPartials(content, callback) {
			autoload.getPartials(content, function(){
				var args = Array.prototype.slice.call(arguments);

				args.push(callback);

				solveDependencies.apply(this, args);
			});
		}

		function solveDependencies(err, content, obj, dependencies, dependees, callback) {

			if(err) return callback(err);
			// Solve dependencies
			template.solveDependencies(obj, dependees, dependencies, function(err, obj){
				var page;
				if(err) return callback(err);

				page = template.interpolate(content, obj);

				callback(null, page);
			});
		}

		return {
			'loadFile': loadFile,
			'getPartials': getPartials
		};
	}
})();