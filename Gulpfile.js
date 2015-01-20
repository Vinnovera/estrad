module.exports = function(gulp) {
	"use strict";

	var
		fs         = require('fs'),
		extend     = require("extend"),
		defaultOpt = JSON.parse(fs.readFileSync(__dirname + '/estrad.json')),
		optExists  = fs.existsSync(process.cwd() + '/estrad.json'),
		opt        = (optExists) ? JSON.parse(fs.readFileSync(process.cwd() + '/estrad.json')) : {}, 
		options    = extend(defaultOpt, opt), 
		paths      = options.paths;

	require('./tasks/js')(gulp, options);
	require('./tasks/css')(gulp, options);
	require('./tasks/server')(gulp, options);
	require('./tasks/image')(gulp, options);
	require('./tasks/html')(gulp, options);

	if(!gulp) gulp = require('gulp');

	/**
	 * Build
	 */
	gulp.task('estrad-build', ['estrad-buildhtml', 'estrad-compasscompile']);

	/**
	 * Watch
	 */
	gulp.task('estrad-watch', ['estrad-jswatch', 'estrad-svgwatch', 'estrad-imagewatch', 'estrad-csswatch', 'estrad-compasswatch']);

	/**
	 * Default
	 */
	gulp.task('estrad', ['estrad-server', 'estrad-watch'], function() {

		// Start the server, if a change is detected restart it
		if(options.watch.server) {
			gulp.watch(paths.server.listen, ['estrad-server']);
		}
	});

	process.on('uncaughtException', function(err) {
		console.log(err.message);
		console.log(err.stack);
		process.exit(1);
	});
};