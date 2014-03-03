(function(){
	"use strict";

	var
		fs = require("fs"),
		chalk = require("chalk");

	module.exports = new FileHelper();

	function FileHelper(){
		function fileContents(file, callback) {
			fileExists(file, function(exists){
				if(!exists) return callback(new Error("File not found: " + chalk.magenta(file)));

				readFile(file, callback);
			});
		}

		function fileExists(file, callback){
			fs.exists(process.cwd() + '/' + file, function(exists){
				callback(exists);
			});
		}

		function readFile(file, callback) {
			// It would be nice to keep the file as a Buffer
			fs.readFile(process.cwd() + '/' + file, {"encoding": "utf8"}, function(err, data){
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