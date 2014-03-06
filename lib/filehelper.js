(function(){
	"use strict";

	var
		fs = require("fs"),
		chalk = require("chalk");

	module.exports = new FileHelper();

	function FileHelper(){
		function fileContents(file, obj, callback) {
			// Allow callback being set as second parameter
			// obj is optional
			if(typeof callback !== 'function' && typeof obj === 'function') {
				callback = obj;
				obj = {};
			} else if (typeof callback !== 'function') {
				return callback(new Error('readFile: Missing callback'));
			}

			fileExists(file, function(exists){
				if(!exists) return callback(new Error("File not found: " + chalk.magenta(file)));

				readFile(file, obj, callback);
			});
		}

		function fileExists(file, callback){
			fs.exists(process.cwd() + '/' + file, function(exists){
				callback(exists);
			});
		}

		function readFile(file, obj, callback) {
			// It would be nice to keep the file as a Buffer
			fs.readFile(process.cwd() + '/' + file, obj, function(err, data){
				if(err) return callback(err);
				callback(err, data);
			});
		}

		return {
			"fileContents": fileContents,
			"fileExists": fileExists
		};
	}
})();