module.exports = function (gulp, options) {
	"use strict";

	var
		partials = require('gulp-estrad-template'),
		paths    = options.paths;

	gulp.task('estrad-html_build', function() {
		var 
			srcPaths = paths.src;

		if(!options.build) return;

		srcPaths.push('!' + paths.dest + '/**/*.html');

		// Build html files
		return gulp.src(srcPaths)
			.pipe(partials())
			.pipe(gulp.dest(paths.dest));
	});
};