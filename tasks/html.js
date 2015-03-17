module.exports = function (gulp, options) {
	"use strict";

	var
		gulpif   = require('gulp-if'),
		partials = require('gulp-estrad-template'),
		prettify = require('gulp-prettify'),
		rename   = require('gulp-rename'),
		paths    = options.html.paths;

	gulp.task('estrad-html_build', ['estrad-clean_build'], function() {
		var 
			srcPaths = paths.src;

		if(!options.html.build) return;

		srcPaths.push('!' + options.dir.build);

		// Build html files
		return gulp.src(srcPaths)
			.pipe(partials({
				folder: options.dir.partials
			}))
			.pipe(rename(function(path) {
				var
					sourceDir = options.dir.src.replace(/^\/|\/$/g, ''),
					index = path.dirname.indexOf(sourceDir);

				if(index !== -1) {
					path.dirname = path.dirname.replace(sourceDir, '');
				}
			}))
			.pipe(gulpif(options.html.prettify, prettify(options.html.prettify)))
			.pipe(gulp.dest(paths.dest));
	});
};