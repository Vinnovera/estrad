module.exports = function (gulp, options) {
	"use strict";

	var
		concat = require('gulp-concat'),
		stylus = require('gulp-stylus'),
		nib = require('nib'),
		// 'child_process.spawn() that works with windows'
		spawn  = require('win-spawn'),
		helper = require('../lib/helper'),
		paths  = options.paths,
		csstimeout, compass;

	gulp.task('estrad-compasscompile', function() {
		if(!options.build.compass) return;

		spawn('compass', ['compile'], {stdio: 'inherit'});
	});

	gulp.task('estrad-csswatch', function() {
		if(!options.watch.css) return; 

		helper.startWatcher(paths.style.listen, cssTask);
	});

	gulp.task('estrad-compasswatch', function() {
		if(!options.process.compass) return; 

		if(compass) compass.kill();
		compass =  spawn('compass', ['watch'], {stdio: 'inherit'});
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
		if(!options.task.css.concat) return;

		return gulp.src(paths.style.src)
			.pipe(concat(paths.style.dest.file))
			.pipe(gulp.dest(paths.style.dest.dir));
	}

	/* Stylus */
	gulp.task('estrad-stylus', function() {
		return stylTask();
	});

	gulp.task('estrad-styluswatch', ['estrad-stylus'], function() {
		if(!options.watch.styl) return;

		helper.startWatcher(paths.style.listen, stylTask);
	});

	function stylTask() {
		return gulp.src(paths.style.src)
			.pipe(stylus({use: [nib()]})
			.on('error', stylError))
			.pipe(gulp.dest(paths.style.dest.dir));
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