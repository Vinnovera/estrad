module.exports = function (gulp, o) {
	"use strict";

	var
		gulpif   = require('gulp-if'),
		partials = require('gulp-estrad-template'),
		prettify = require('gulp-prettify'),
		rename   = require('gulp-rename'),
		helper   = require('../lib/helper'),
		paths    = o.html.paths;

	gulp.task('estrad-html_build', ['estrad-clean_build'], function() {
		var 
			srcPath  = helper.prependPath(o.dir.src, paths.src),
			destPath = helper.prependPath(o.dir.dest, paths.dest);

		if(!o.html.build) return;

		srcPath.push('!' + o.dir.partials);

		// Build html files
		return gulp.src(srcPath)
			.pipe(partials({
				folder: o.dir.partials
			}))
			.pipe(rename(function(path) {
				var
					sourceDir = o.dir.src.replace(/^\/|\/$/g, ''),
					index = path.dirname.indexOf(sourceDir);

				if(index !== -1) {
					path.dirname = path.dirname.replace(sourceDir, '');
				}
			}))
			.pipe(gulpif(o.html.prettify, prettify(o.html.prettify)))
			.pipe(gulp.dest(destPath));
	});
};