(function () {
	"use strict";

	var
		chalk    = require('chalk'),
		chokidar = require('glob-chokidar'),
		fs       = require('fs'),
		extend   = require('extend'),
		path     = require('path');

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

	function writeFile(filename, content, callback) {
		var
			dir = path.dirname(filename);

		fs.exists(process.cwd() + '/' + dir, function(exists) {
			if(!exists) {
				fs.mkdir(process.cwd() + '/' + dir, function(err) {
					if(err) throw err;
					
					privateWriteFile(filename, content, callback);
				});
				return;
			}

			privateWriteFile(filename, content, callback);
		});
	}


	function removeFolder (path) {
		var files = [];
		if( fs.existsSync(path) ) {
			files = fs.readdirSync(path);
			files.forEach(function(file, index){
				var curPath = path + "/" + file;
				if(fs.lstatSync(curPath).isDirectory()) { 

					// recurse
					removeFolder(curPath);
				} else { 

					// delete file
					fs.unlinkSync(curPath);
				}
			});
			fs.rmdirSync(path);
		}
	}

	function privateWriteFile(filename, content, callback) {
		fs.writeFile(process.cwd() + filename, content, function(err) {
			if(err) throw err;

			console.log("["+ chalk.green("estrad") + "] Saving: " + chalk.magenta(filename));

			if(callback) callback();
		});
	}

	function getEstradOptions() {
		var
			defaultOpt = JSON.parse(fs.readFileSync(__dirname + '/../estrad.json')),
			optExists  = fs.existsSync(process.cwd() + '/estrad.json'),
			opt        = (optExists) ? JSON.parse(fs.readFileSync(process.cwd() + '/estrad.json')) : {};

		return extend(defaultOpt, opt);
	}

	module.exports = {
		startWatcher: startWatcher,
		readContent: readContent,
		readContentIfExists: readContentIfExists,
		writeFile: writeFile,
		removeFolder: removeFolder,
		getEstradOptions: getEstradOptions
	};

})();