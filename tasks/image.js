module.exports = function (gulp, o) {
	"use strict";

	var
		fs       = require("fs"),
		svg2png  = require('gulp-svg2png'),
		imagemin = require('gulp-imagemin'),
		optipng  = require('imagemin-optipng'),
		gifsicle = require('imagemin-gifsicle'),
		jpegtran = require('imagemin-jpegtran'),
		svgo     = require('imagemin-svgo'),
		path     = require('path'),
		helper   = require('../lib/helper'),
		paths    = o.images.paths;

	gulp.task('estrad-image_watch', function() {
		var
			pathsListen = helper.prependPath(o.dir.src, paths.listen);

		if(!o.images.watch) return;

		helper.startWatcher(pathsListen, imageTask);
	});

	gulp.task('estrad-image_build', ['estrad-clean_build'], function() {
		if(!o.images.build) return;

		return imageMin();
	});

	function imageTask(event, imageFile) {
		switch(event) {
			case 'add':
			case 'change':
				imageMin(imageFile);

				if(o.images.svgToPng) {
					svgToPng(imageFile);
				}
			break;
			case 'unlink':
				unlinkPng(imageFile);
			break;
		}
	}

	function imageMin(imageFile) {
		var
			destPath = helper.prependPath(o.dir.src, paths.dest),
			files    = imageFile || helper.prependPath(o.dir.src, paths.listen);

		return gulp.src(files)
			.pipe(imagemin({
				progressive: true,
				svgoPlugins: [{removeViewBox: false}],
				use: [optipng(), gifsicle(), jpegtran(), svgo()]
			}))
			.pipe(gulp.dest(destPath));
	}

	function svgToPng(filePath) {
		if(path.extname(filePath) !== '.svg') return;

		return gulp.src(filePath)
			.pipe(svg2png())
			.pipe(gulp.dest(path.dirname(filePath)));
	}

	function unlinkPng(filePath) {
		if(path.extname(filePath) === '.svg') {
			fs.unlink(filePath.replace('.svg', '.png'));
		}
	}
};