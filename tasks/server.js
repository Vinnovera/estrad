module.exports = function (gulp, o) {
	"use strict";

	var
		spawn = require('win-spawn'),
		node;

	// https://gist.github.com/webdesserts/5632955
	gulp.task('estrad-server', function() {
		if(!o.start) return; 

		if(node) node.kill();
		node = spawn('node', [__dirname + '/../index.js'], {stdio: 'inherit'});

		node.on('close', function(code) {
			if(code === 8) {
				console.log('Error detected, waiting for changes...');
			}
		});
	});

	// clean up if an error goes unhandled.
	process.on('exit', function() {
		if (node) node.kill();
	});
};