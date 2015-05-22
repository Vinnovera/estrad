module.exports = function (gulp, o) {
	"use strict";

	var
		concat    = require('gulp-concat'),
		stylus    = require('gulp-stylus'),
		gulpif    = require('gulp-if'),
		ignore    = require('gulp-ignore'),
		rename    = require('gulp-rename'),
		minify    = require('gulp-minify-css'),
		path      = require('path'),

		spawn  = require('win-spawn'),
		helper = require('../lib/helper'),
		paths  = o.css.paths,
		csstimeout, compass;

	gulp.task('estrad-css_build', ['estrad-image_build', 'estrad-clean_build'], function(callback) {
		if(!o.css.build) return callback();

		if(!o.css.preprocessor) {
			cssConcat(true, callback);

		} else if(o.css.preprocessor === "sass") {
			spawn('compass', ['compile'], {stdio: 'inherit'});
			callback();

		} else if(o.css.preprocessor === "stylus") {
			stylTask(true, callback);
		}
	});

	gulp.task('estrad-css_watch', function(callback) {
		var
			pathsListen = helper.prependPath(o.dir.src, paths.listen);

		if(!o.css.watch) return callback();

		if(!o.css.preprocessor) {
			cssConcat(callback);
			helper.startWatcher(pathsListen, cssTask);

		} else if(o.css.preprocessor === "sass") {
			
			if(compass) compass.kill();
			compass = spawn('compass', ['watch'], {stdio: 'inherit'});
			callback();

		} else if(o.css.preprocessor === "stylus") {
			stylTask(callback);
			helper.startWatcher(pathsListen, stylTask);
		}
	});

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

	function cssConcat(buildTask, callback) {
		var
			sourcePath = helper.prependPath(o.dir.src, paths.src),
			destPath, stream;

		if(typeof buildTask === 'function') callback = buildTask;
		if(!callback || typeof callback !== 'function') callback = function() {};

		if(buildTask !== true) {
			destPath = helper.prependPath(o.dir.src, paths.dest);
		} else {
			destPath = helper.prependPath(o.dir.dest, paths.dest);
		}

		stream = gulp.src(sourcePath)
			.pipe(concat(path.basename(destPath)))
			.pipe(gulp.dest(path.dirname(destPath)))

			/**
			 * === Watch task ends here === *
			 * 
			 * Do not compress CSS if buildTask or o.css.minify is false
			 */
			.pipe(gulpif(buildTask !== true || !o.css.minify, ignore.exclude(true)))
			.pipe(minify())
			.pipe(rename(function(path) {
				path.extname = '.min' + path.extname;
			}))
			.pipe(gulp.dest(path.dirname(destPath)));

		stream.on('end', callback);
		stream.on('error', callback);
	}

	/* Stylus */
	function stylTask(buildTask, callback) {
		var
			sourcePath = helper.prependPath(o.dir.src, paths.src),
			destPath, stream;

		if(typeof buildTask === 'function') callback = buildTask;
		if(!callback || typeof callback !== 'function') callback = function() {};

		// Explicit true
		if(buildTask !== true) {
			destPath = helper.prependPath(o.dir.src, paths.dest);
		} else {
			destPath = helper.prependPath(o.dir.dest, paths.dest);
		}

		if(path.extname(destPath)) destPath = path.dirname(destPath);

		stream = gulp.src(sourcePath)
			.pipe(stylus(o.css.settings)
				.on('error', stylError)
			)
			.pipe(gulp.dest(destPath))

			/**
			 * === Watch task ends here === *
			 * 
			 * Do not compress CSS if buildTask or o.css.minify is false
			 */
			.pipe(gulpif(buildTask !== true || !o.css.minify, ignore.exclude(true)))
			.pipe(minify())
			.pipe(rename(function(path) {
				path.extname = '.min' + path.extname;
			}))
			.pipe(gulp.dest(destPath));

		stream.on('end', callback);
		stream.on('error', callback);
	}

	// Catch errors and output them without terminating the process
	function stylError(err) {
		console.log(err.message);
		console.log(err.stack);

		this.emit('end');
	}

	// Clean up if an error goes unhandled
	process.on('exit', function() {
		if (compass) compass.kill();
	});

	// Make accessable for testing
	return {
		cssConcat: cssConcat,
		stylTask: stylTask
	};
};
