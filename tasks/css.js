module.exports = function (gulp, o) {
	"use strict";

	var
		concat    = require('gulp-concat'),
		stylus    = require('gulp-stylus'),
		nib       = require('nib'),
		extend    = require('extend'),
		gulpif    = require('gulp-if'),
		ignore    = require('gulp-ignore'),
		rename    = require('gulp-rename'),
		inlineSVG = require('stylus-inline-svg'),
		path      = require('path'),
		minify    = require('gulp-minify-css'),

		spawn  = require('win-spawn'),
		helper = require('../lib/helper'),
		paths  = o.css.paths,
		csstimeout, compass;

	gulp.task('estrad-css_build', ['estrad-image_build', 'estrad-clean_build'], function() {
		if(!o.css.build) return;

		if(!o.css.preprocessor) {
			cssConcat(true);

		} else if(o.css.preprocessor === "sass") {
			spawn('compass', ['compile'], {stdio: 'inherit'});

		} else if(o.css.preprocessor === "stylus") {
			stylTask(true);
		}
	});

	gulp.task('estrad-css_watch', function() {
		var
			pathsListen = helper.prependPath(o.dir.src, paths.listen);

		if(!o.css.watch) return;

		if(!o.css.preprocessor) {
			cssConcat();
			helper.startWatcher(pathsListen, cssTask);

		} else if(o.css.preprocessor === "sass") {
			
			if(compass) compass.kill();
			compass =  spawn('compass', ['watch'], {stdio: 'inherit'});

		} else if(o.css.preprocessor === "stylus") {
			stylTask();
			helper.startWatcher(pathsListen, stylTask);
		}
	});

	/* CSS */
	function cssTask(event) {
		switch(event) {
			case 'add':
				clearTimeout(csstimeout);
				csstimeout = setTimeout(function(){
					cssConcat();
				}, 10);
			break;
			case 'change':
			case 'unlink':
				cssConcat();
			break;
		}
	}

	function cssConcat(buildTask) {
		var
			sourcePath = helper.prependPath(o.dir.src, paths.src),
			destPath;

		if(!buildTask) {
			destPath = helper.prependPath(o.dir.src, paths.dest);
		} else {
			destPath = helper.prependPath(o.dir.dest, paths.dest);
		}

		return gulp.src(sourcePath)
			.pipe(concat(path.basename(destPath)))
			.pipe(gulp.dest(path.dirname(destPath)));
	}

	/* Stylus */
	function stylTask(buildTask) {
		var
			sourcePath = helper.prependPath(o.dir.src, paths.src),
			destPath;

		// Explicit true
		if(buildTask !== true) {
			destPath = helper.prependPath(o.dir.src, paths.dest);
		} else {
			destPath = helper.prependPath(o.dir.dest, paths.dest);
		}

		if(path.extname(destPath)) destPath = path.dirname(destPath);

		return gulp.src(sourcePath)
			.pipe(stylus(o.css.settings)
				.on('error', stylError)
			)
			.pipe(gulp.dest(destPath))

			/**
			 * === Watch task ends here === *
			 * 
			 * Do not compress CSS if buildTask or o.css.minify is false
			 */
			.pipe(gulpif(!buildTask || !o.css.minify, ignore.exclude(true)))
			.pipe(minify())
			.pipe(rename(function(path) {
				path.extname = '.min' + path.extname;
			}))
			.pipe(gulp.dest(destPath));
	}

	// Silently catch errors and output them without terminating the process
	function stylError(err) {
		console.log(err.message);
		console.log(err.stack);

		this.emit('end');
	}

	// Clean up if an error goes unhandled
	process.on('exit', function() {
		if (compass) compass.kill();
	});
};
