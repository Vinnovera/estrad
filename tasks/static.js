module.exports = function(gulp, options) {
	"use strict";

	gulp.task('estrad-static_build', ['estrad-clean_build'], function() {
		if(!options.static.build) return;

		gulp.src(options.static.paths.from, { base: process.cwd() + '/' + options.sourceDir })
			.pipe(gulp.dest(options.static.paths.to));
	});
};