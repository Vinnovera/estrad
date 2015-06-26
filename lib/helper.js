(function () {
	"use strict";

	var
		chalk    = require('chalk'),
		chokidar = require('glob-chokidar'),
		fs       = require('fs'),
		extend   = require('extend'),
		path     = require('path'),
		rimraf   = require('rimraf');

	function startWatcher(paths, callback) {
		chokidar(paths, function(ev, path) {
			console.log("["+ chalk.green("estrad") + "] File event " + chalk.cyan(ev) + ": " + chalk.magenta(path));

			callback(ev, path);
		});
	}

	function readContent(filename, callback) {
		fs.readFile(cwd(filename), {'encoding': 'utf8'}, function(err, data) {
			if(err) return callback(err);

			callback(null, data);
		});
	}

	function readContentIfExists(filename, callback) {
		fs.exists(cwd(filename), function(exists) {
			if(!exists) return callback(new Error('File not found'));

			readContent(filename, callback);
		});
	}

	function writeFile(filename, content, callback) {
		var
			dir = path.dirname(filename);

		fs.exists(cwd(dir), function(exists) {

			if(!exists) {
				fs.mkdir(cwd(dir), function(err) {
					if(err) throw err;
					
					privateWriteFile(filename, content, callback);
				});
			
			} else {
				privateWriteFile(filename, content, callback);
			}
		});
	}

	function removeFolder(path, cb) {
		if(!cb || typeof cb !== 'function') cb = function() {};

		// Do not remove everyhing in root
		if(!path || path === '/') return cb();

		path = cwd(path);

		fs.exists(path, function(exists) {
			if(!exists) return cb();

			rimraf(path, function() {
				
				return cb();
			});
		});
	}

	function privateWriteFile(filename, content, callback) {
		fs.writeFile(cwd(filename), content, function(err) {
			if(err) throw err;

			console.log("["+ chalk.green("estrad") + "] Saving: " + chalk.magenta(filename));

			if(callback) callback();
		});
	}

	function extendDefaultOptions(options) {
		var
			defaultOpt = JSON.parse(fs.readFileSync(__dirname + '/../estrad.json'));

		options = options || {};

		return extend(true, defaultOpt, options);
	}

	function cwd () {
		return process.cwd() + '/' + Array.prototype.slice.call(arguments).join('/');
	}

	function prependPath (pre, path) {
		if(pre.substr(pre.length - 1, 1) !== '/') pre = pre + '/';

		if(typeof path === 'string') {
			return pre + path;
		}

		// path is an array, add pre to each
		return path.map(function (item) {
			if(item.indexOf('!') !== -1) {
				return '!' + (pre + item.substr(1));
			}

			return pre + item;
		});
	}

	function getExtension(_path) {
		var
			extname = path.extname(_path);

		console.log(extname);

		return extname;
	}

	module.exports = {
		startWatcher: startWatcher,
		readContent: readContent,
		readContentIfExists: readContentIfExists,
		writeFile: writeFile,
		removeFolder: removeFolder,
		extendDefaultOptions: extendDefaultOptions,
		cwd: cwd,
		prependPath: prependPath
	};

})();