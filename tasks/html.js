module.exports = function (gulp, options) {
	"use strict";

	var
		partials = require('gulp-estrad-template'),
		paths    = options.paths;

	gulp.task('buildhtml', function() {
		var 
			srcPaths = paths.build.src;

		if(!options.build.html) return;

		srcPaths.push('!' + paths.build.dest + '/**/*.html');

		// Build html files
		return gulp.src(srcPaths)
			.pipe(partials())
			.pipe(gulp.dest(paths.build.dest));
	});
};