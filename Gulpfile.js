(function(){
	"use strict";

var 
	gulp = require('gulp'),
	jshint = require('gulp-jshint'),
	jshintStylish = require('jshint-stylish'),
	concat = require('gulp-concat'),
	prettify = require('gulp-prettify'),
	partials = require('gulp-estrad-template'),
	svg2png = require('gulp-svg2png'),
	imagemin = require('gulp-imagemin'),
	optipng = require('imagemin-optipng'),
	gifsicle = require('imagemin-gifsicle'),
	jpegtran = require('imagemin-jpegtran'),
	svgo = require('imagemin-svgo'),

	chokidar = require('glob-chokidar'),
	chalk = require('chalk'),
	path = require("path"),
	// 'child_process.spawn() that works with windows'
	spawn = require('win-spawn'),
	fs = require('fs'),
	jshintRc = JSON.parse(fs.readFileSync('./.jshintrc', 'utf-8')),
	pkg = JSON.parse(fs.readFileSync('./package.json')),
	opt = JSON.parse(fs.readFileSync('./estrad.json')),
	paths = opt.paths,
	node, compass, jstimeout, csstimeout;

// https://gist.github.com/webdesserts/5632955
gulp.task('server', function() {
	if(!opt.process.server) return; 

	if(node) node.kill();
	node = spawn('node', [paths.server.execute], {stdio: 'inherit'});

	node.on('close', function(code) {
		if(code === 8) {
			console.log('Error detected, waiting for changes...');
		}
	});
});

/**
 * Build
 */
gulp.task('build', ['buildhtml', 'compasscompile']);

gulp.task('buildhtml', function() {
	var 
		srcPaths = paths.build.src;

	if(!opt.build.html) return;

	srcPaths.push('!' + paths.build.dest + '/**/*.html');

	// Build html files
	return gulp.src(srcPaths)
		.pipe(partials())
		.pipe(prettify())
		.pipe(gulp.dest(paths.build.dest));
});

gulp.task('compasscompile', function() {
	if(!opt.build.compass) return;

	spawn('compass', ['compile'], {stdio: 'inherit'});
});

/**
 * Watch
 */
gulp.task('watch', ['jswatch', 'svgwatch', 'imagewatch', 'csswatch', 'compasswatch']);

gulp.task('jswatch', function() {
	if(!opt.watch.js) return;

	startWatcher(paths.script.listen, jsTask);
});

gulp.task('csswatch', function() {
	if(!opt.watch.css) return; 

	startWatcher(paths.style.listen, cssTask);
});

gulp.task('compasswatch', function() {
	if(!opt.process.compass) return; 

	if(compass) compass.kill();
	compass =  spawn('compass', ['watch'], {stdio: 'inherit'});
});

gulp.task('svgwatch', function() {
	if(!opt.watch.svg) return;

	startWatcher(paths.svg2png.listen, svg2pngTask);
});

gulp.task('imagewatch', function() {
	if(!opt.watch.images) return;

	startWatcher(paths.image.listen, imageTask);
});

gulp.task('default', ['server', 'watch'], function(){
	// Start the server, if a change is detected restart it
	if(opt.watch.server) {
		gulp.watch(paths.server.listen, ['server']);
	}
});

function startWatcher(paths, callback) {
	chokidar(paths, function(ev, path) {
		console.log("[" + chalk.green(pkg.name) + "] File event " + chalk.cyan(ev) + ": " + chalk.magenta(path));

		callback(ev, path);
	});
}

/**
 * Tasks
 */

/* JS */
function jsTask(event, path) {
	switch(event) {
		case 'add':
			clearTimeout(jstimeout);
			jstimeout = setTimeout(function(){
				jsLint(path);
			},10);
		break;
		case 'change':
			jsLint(path);
		case 'unlink':
		break;
	}
}

function jsLint(path) {
	if(!opt.task.js.jshint) return;

	return gulp.src(path)
		.pipe(jshint(jshintRc))
		.pipe(jshint.reporter(jshintStylish));
}

/* CSS */
function cssTask(event, path) {
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
	if(!opt.task.css.concat) return;

	return gulp.src(paths.style.src)
		.pipe(concat(paths.style.dest.file))
		.pipe(gulp.dest(paths.style.dest.dir));
}

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
	if(!opt.task.svg.svg2png) return;

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
	if(!opt.task.image.minify) return;

	return gulp.src(imageFile)
		.pipe(imagemin({
			progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			use: [optipng(), gifsicle(), jpegtran(), svgo()]
		}))
		.pipe(gulp.dest(path.dirname(imageFile)));
}

process.on('uncaughtException',function(err){
	console.log(err.message);
	console.log(err.stack);
	process.exit(1);
});

// clean up if an error goes unhandled.
process.on('exit', function() {
	if (node) node.kill();
	if (compass) compass.kill();
});
})();