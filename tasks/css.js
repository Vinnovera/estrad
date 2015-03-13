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
		paths  = options.paths,
		stylO  = extend({
			use: [nib()],
			define: {
				url: inlineSVG({paths: paths.src.map(function(item) {
					return process.cwd() + '/' + path.dirname(item);
				})})
			}
		}, options.settings),
		csstimeout, compass;

	gulp.task('estrad-css_build', ['estrad-image_build', 'estrad-clean_build'], function() {
		if(!options.build) return;

		if(!options.preprocessor) {
			cssConcat();

		} else if(options.preprocessor === "sass") {
			spawn('compass', ['compile'], {stdio: 'inherit'});

		} else if(options.preprocessor === "stylus") {
			stylTask(true);
		}
	});

	gulp.task('estrad-css_watch', function() {
		if(!options.watch) return;

		if(!options.preprocessor) {
			cssConcat();
			helper.startWatcher(paths.listen, cssTask);

		} else if(options.preprocessor === "sass") {
			
			if(compass) compass.kill();
			compass =  spawn('compass', ['watch'], {stdio: 'inherit'});

		} else if(options.preprocessor === "stylus") {
			stylTask();
			helper.startWatcher(paths.listen, stylTask);
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

		return gulp.src(paths.src)
			.pipe(concat(paths.dest.file))
			.pipe(gulp.dest(paths.dest.dir));
	}

	/* Stylus */
	function stylTask(buildTask) {

		return gulp.src(paths.src)
			.pipe(stylus(stylO)
				.on('error', stylError)
			)
			.pipe(gulp.dest(paths.dest.dir))

			/**
			 * === Watch task ends here === *
			 * 
			 * Do not compress CSS if not buildTask or boolean uglify is false
			 */
			.pipe(gulpif(!buildTask || !options.uglify, ignore.exclude(true)))
			
			.pipe(minify())
			.pipe(rename(function(path) {
				path.extname = '.min' + path.extname;
			}))
			.pipe(gulp.dest(paths.dest.dir));
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
