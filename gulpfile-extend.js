module.exports = function(gulp) {
	"use strict";

	var
		helper     = require('./lib/helper'),
		options    = helper.getEstradOptions();

	require('./tasks/js')(gulp, options);
	require('./tasks/css')(gulp, options.css);
	require('./tasks/server')(gulp, options.server);
	require('./tasks/image')(gulp, options.images);
	require('./tasks/html')(gulp, options);

	/**
	 * Build
	 */
	gulp.task('estrad-build', ['estrad-html_build', 'estrad-css_build', 'estrad-js_build'], function() {
		helper.removeFolder('/.estrad');
	});

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