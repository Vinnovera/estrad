(function () {
	"use strict";

	var
		chalk    = require('chalk'),
		chokidar = require('glob-chokidar');

	function startWatcher(paths, callback) {
		chokidar(paths, function(ev, path) {
			console.log("[estrad] File event " + chalk.cyan(ev) + ": " + chalk.magenta(path));

			callback(ev, path);
		});
	}

	module.exports = {
		startWatcher: startWatcher
	};

})();