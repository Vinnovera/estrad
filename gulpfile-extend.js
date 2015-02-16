module.exports = function(gulp) {
	"use strict";

	var
		fs         = require('fs'),
		extend     = require("extend"),
		defaultOpt = JSON.parse(fs.readFileSync(__dirname + '/estrad.json')),
		optExists  = fs.existsSync(process.cwd() + '/estrad.json'),
		opt        = (optExists) ? JSON.parse(fs.readFileSync(process.cwd() + '/estrad.json')) : {}, 
		options    = extend(defaultOpt, opt);

	require('./tasks/js')(gulp, options);
	require('./tasks/css')(gulp, options.css);
	require('./tasks/server')(gulp, options.server);
	require('./tasks/image')(gulp, options.images);
	require('./tasks/html')(gulp, options.html);

	/**
	 * Build
	 */
	gulp.task('estrad-build', ['estrad-html_build', 'estrad-css_build', 'estrad-js_build']);

	/**
	 * Watch
	 */
	gulp.task('estrad-watch', ['estrad-js_watch', 'estrad-image_watch', 'estrad-css_watch']);

	/**
	 * Default
	 */
	gulp.task('estrad', ['estrad-server', 'estrad-watch']);

	process.on('uncaughtException', function(err) {
		console.log(err.message);
		console.log(err.stack);
		process.exit(1);
	});
};