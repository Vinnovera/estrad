module.exports = function (gulp, options) {
	"use strict";

	var
		fs = require("fs"),
		svg2png  = require('gulp-svg2png'),
		imagemin = require('gulp-imagemin'),
		optipng  = require('imagemin-optipng'),
		gifsicle = require('imagemin-gifsicle'),
		jpegtran = require('imagemin-jpegtran'),
		svgo     = require('imagemin-svgo'),
		path     = require("path"),
		helper   = require('../lib/helper'),
		paths    = options.paths;

	gulp.task('estrad-svgwatch', function() {
		if(!options.watch.svg) return;

		helper.startWatcher(paths.svg2png.listen, svg2pngTask);
	});

	gulp.task('estrad-imagewatch', function() {
		if(!options.watch.images) return;

		helper.startWatcher(paths.image.listen, imageTask);
	});

	function svg2pngTask(event, svgFile) {
		switch(event) {
			case 'add':
			case 'change':
				svgSvgToPng(svgFile);
			break;
			case 'unlink':
				fs.unlink(svgFile.replace('.svg', '.png'));
			break;
		}
	}

	function svgSvgToPng(svgFile) {
		if(!options.task.svg.svg2png) return;

		return gulp.src(svgFile)
			.pipe(svg2png())
			.pipe(gulp.dest(path.dirname(svgFile)));
	}

	function imageTask(event, imageFile) {
		switch(event) {
			case 'add':
			case 'change':
				imageMin(imageFile);
			break;
		}
	}

	function imageMin(imageFile) {
		if(!options.task.image.minify) return;

		return gulp.src(imageFile)
			.pipe(imagemin({
				progressive: true,
				svgoPlugins: [{removeViewBox: false}],
				use: [optipng(), gifsicle(), jpegtran(), svgo()]
			}))
			.pipe(gulp.dest(path.dirname(imageFile)));
	}
};