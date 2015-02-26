module.exports = function (gulp, options) {
	"use strict";

	var
		concat = require('gulp-concat'),
		stylus = require('gulp-stylus'),
		nib    = require('nib'),
		extend = require('extend'),

		// child_process.spawn() that works with windows
		spawn  = require('win-spawn'),
		helper = require('../lib/helper'),
		paths  = options.paths,
		stylO  = extend({use: [nib()]}, options.settings),
		csstimeout, compass;

	gulp.task('estrad-css_build', function() {
		if(!options.build) return;

		if(!options.preprocessor) {
			cssConcat();

		} else if(options.preprocessor === "sass") {
			spawn('compass', ['compile'], {stdio: 'inherit'});

		} else if(options.preprocessor === "stylus") {
			stylTask();
		}
	});

	gulp.task('estrad-css_watch', function() {
		if(!options.watch) return;

		if(!options.preprocessor) {
			helper.startWatcher(paths.listen, cssTask);

		} else if(options.preprocessor === "sass") {
			if(compass) compass.kill();
			compass =  spawn('compass', ['watch'], {stdio: 'inherit'});

		} else if(options.preprocessor === "stylus") {
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
	function stylTask() {
		return gulp.src(paths.src)
			.pipe(stylus(stylO)
			.on('error', stylError))
			.pipe(gulp.dest(paths.dest.dir));
	}

	function stylError(err) {
		console.log(err.message);
		console.log(err.stack);

		this.emit('end');
	}

	// clean up if an error goes unhandled.
	process.on('exit', function() {
		if (compass) compass.kill();
	});
};
