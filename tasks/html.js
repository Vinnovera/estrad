module.exports = function (gulp, options) {
	"use strict";

	var
		gulpif   = require('gulp-if'),
		partials = require('gulp-estrad-template'),
		prettify = require('gulp-prettify'),
		rename   = require('gulp-rename'),
		helper   = require('../lib/helper'),
		paths    = options.html.paths;

	gulp.task('estrad-html_build', ['estrad-clean_build'], function() {
		var 
			srcPath  = helper.prependPath(options.dir.src, paths.src),
			destPath = helper.prependPath(options.dir.dest, paths.dest);

		if(!options.html.build) return;

		srcPaths.push('!' + options.dir.partials);

		// Build html files
		return gulp.src(srcPath)
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
			.pipe(gulp.dest(destPath));
	});
};