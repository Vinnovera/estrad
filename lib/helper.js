(function () {
	"use strict";

	var
		chalk    = require('chalk'),
		chokidar = require('glob-chokidar'),
		fs       = require('fs');

	function startWatcher(paths, callback) {
		chokidar(paths, function(ev, path) {
			console.log("["+ chalk.green("estrad") + "] File event " + chalk.cyan(ev) + ": " + chalk.magenta(path));

			callback(ev, path);
		});
	}

	function readContent(filename, callback) {
		fs.readFile(process.cwd() + filename, {'encoding': 'utf8'}, function(err, data) {
			if(err) return callback(err);

			callback(null, data);
		});
	}

	function readContentIfExists(filename, callback) {
		fs.exists(process.cwd() + filename, function(exists) {
			if(!exists) return callback(new Error('File not found'));

			readContent(filename, callback);
		});
	}

	module.exports = {
		startWatcher: startWatcher,
		readContent: readContent,
		readContentIfExists: readContentIfExists
	};

})();