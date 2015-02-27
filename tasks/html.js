module.exports = function (gulp, options) {
	"use strict";

	var
		partials = require('gulp-estrad-template'),
		rename   = require('gulp-rename'),
		paths    = options.html.paths;

	gulp.task('estrad-html_build', function() {
		var 
			srcPaths = paths.src;

		if(!options.html.build) return;

		srcPaths.push('!' + paths.dest + '/**/*.html');

		// Build html files
		return gulp.src(srcPaths)
			.pipe(partials({
				folder: options.modulesDir
			}))
			.pipe(rename(function(path) {
				var
					sourceDir = options.sourceDir.replace(/^\/|\/$/g, ''),
					index = path.dirname.indexOf(sourceDir);

				if(index !== -1) {
					path.dirname = path.dirname.replace(sourceDir, '');
				}
			}))
			.pipe(gulp.dest(paths.dest));
	});
};