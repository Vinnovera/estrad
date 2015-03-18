module.exports = function (gulp, options) {
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

		// child_process.spawn() that works with windows
		spawn  = require('win-spawn'),
		helper = require('../lib/helper'),
		paths  = options.css.paths,
		csstimeout, compass;

	gulp.task('estrad-css_build', ['estrad-image_build', 'estrad-clean_build'], function() {
		if(!options.css.build) return;

		if(!options.css.preprocessor) {
			cssConcat();

		} else if(options.css.preprocessor === "sass") {
			spawn('compass', ['compile'], {stdio: 'inherit'});

		} else if(options.css.preprocessor === "stylus") {
			stylTask(true);
		}
	});

	gulp.task('estrad-css_watch', function() {
		var
			pathsListen = helper.prependPath(options.dir.src, paths.listen);

		if(!options.css.watch) return;

		if(!options.css.preprocessor) {
			cssConcat();
			helper.startWatcher(pathsListen, cssTask);

		} else if(options.css.preprocessor === "sass") {
			
			if(compass) compass.kill();
			compass =  spawn('compass', ['watch'], {stdio: 'inherit'});

		} else if(options.css.preprocessor === "stylus") {
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

	function cssConcat() {
		var
			sourcePath = helper.prependPath(options.dir.src, paths.src);

		return gulp.src(sourcePath)
			.pipe(concat(path.basename(paths.dest)))
			.pipe(gulp.dest(path.dirname(paths.dest)));
	}

	/* Stylus */
	function stylTask(buildTask) {

		return gulp.src(paths.src)
			.pipe(stylus(options.css.settings)
				.on('error', stylError)
			)
			.pipe(gulp.dest(path.dirname(paths.dest)))

			/**
			 * === Watch task ends here === *
			 * 
			 * Do not compress CSS if buildTask or options.css.minify is false
			 */
			.pipe(gulpif(!buildTask || !options.css.minify, ignore.exclude(true)))
			.pipe(minify())
			.pipe(rename(function(path) {
				path.extname = '.min' + path.extname;
			}))
			.pipe(gulp.dest(path.dirname(paths.dest)));
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
