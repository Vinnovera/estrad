module.exports = function(gulp, options) {
	"use strict";

	var
		helper = require('./lib/helper');

	options = helper.extendDefaultOptions(options);

	require('./tasks/js')(gulp, options);
	require('./tasks/css')(gulp, options);
	require('./tasks/server')(gulp, options);
	require('./tasks/image')(gulp, options);
	require('./tasks/html')(gulp, options);
	require('./tasks/static')(gulp, options);

	/**
	 * Build
	 */
	gulp.task('estrad-clean_build', function(callback) {
		helper.removeFolder(options.dir.dest, callback);
	});

	gulp.task('estrad-build', ['estrad-clean_build', 'estrad-static_build', 'estrad-html_build', 'estrad-image_build', 'estrad-css_build', 'estrad-js_build'], function() {
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

	return options;
};