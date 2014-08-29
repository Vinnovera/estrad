(function(){
	"use strict";

var 
	gulp = require('gulp'),
	jshint = require('gulp-jshint'),
	jshintStylish = require('jshint-stylish'),
	concat = require('gulp-concat'),
	prettify = require('gulp-prettify'),
	compass, // = require('gulp-compass'),
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
	spawn = require('win-spawn'), // 'child_process.spawn() that works with windows'
	fs = require('fs'),
	jshintRc = JSON.parse(fs.readFileSync('./.jshintrc', 'utf-8')),
	pkg = JSON.parse(fs.readFileSync('./package.json')),
	paths = {
		'server': ['./index.js', './lib/**/*.js', 'routes.json'],
		'style': {
			'build': ['./css/**/*.css', './modules/**/*.css', '!css/main.css'],
			'listen': ['modules/**/*.css', 'css/**/*.css'],
		},
		'script': {
			'build': ['./js/**/*.js', './modules/**/*.js', '!js/main.js'],
			'listen': [process.cwd() + '/**/*.js', '!/node_modules/**/*.js'],
			'dest': 'main.js'
		},
		'svg2png': {
			'listen': ['img/**/*.svg']
		},
		'image': {
			'listen': ['img/**/*.jpg', 'img/**/*.gif', 'img/**/*.png', 'img/**/*.svg']
		},
		'build': {
			'src': ['./**/*.html', '!./html/**/*.html', '!./modules/**/*.html', '!./node_modules/**/*.html'],
			'dest': './package'
		}
	},
	node, jstimeout, csstimeout;

// https://gist.github.com/webdesserts/5632955
gulp.task('server', function(){
	if(node) node.kill();
	node = spawn('node', ['./index.js'], {stdio: 'inherit'});

	node.on('close', function(code) {
		if(code === 8) {
			console.log('Error detected, waiting for changes...');
		}
	});
});

/**
 * Build
 */

gulp.task('build', ['buildhtml']);

gulp.task('buildhtml', function() {
	var 
		srcPaths = paths.build.src;

	srcPaths.push('!' + paths.build.dest + '/**/*.html');

	// Build html files
	return gulp.src(srcPaths)
		.pipe(partials())
		.pipe(prettify())
		.pipe(gulp.dest(paths.build.dest));
});

/**
 * Watch
 */
gulp.task('watch', ['jswatch', 'svgwatch', 'imagewatch']);

gulp.task('jswatch', function() {
	startWatcher(paths.script.listen, function(event, pathname) {
		jsTask(event, pathname);
	});
});

gulp.task('csswatch', function() {
	startWatcher(paths.style.listen, cssTask);
});

gulp.task('scsswatch', function() {
	if(compass) compass.kill();
	compass =  spawn('compass', ['watch'], {stdio: 'inherit'});
});

gulp.task('svgwatch', function() {
	startWatcher(paths.svg2png.listen, svg2pngTask);
});

gulp.task('imagewatch', function() {
	startWatcher(paths.image.listen, imageTask);
});

gulp.task('default', ['server', 'watch'], function(){
	// Start the server, if a change is detected restart it
	gulp.watch(paths.server, ['server']);
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
	return gulp.src(paths.style.build)
		.pipe(concat('main.css'))
		.pipe(gulp.dest('./css/'));
}

function svg2pngTask(event, svgFile) {
	switch(event) {
		case 'add':
		case 'change':
			return gulp.src(svgFile)
				.pipe(svg2png())
				.pipe(gulp.dest(path.dirname(svgFile)));
		break;
		case 'unlink':
			fs.unlink(svgFile.replace('.svg','.png'));
		break;
	}
}

function imageTask(event, imageFile) {
	switch(event) {
		case 'add':
		case 'change':
			return gulp.src(imageFile)
				.pipe(imagemin({
					progressive: true,
					svgoPlugins: [{removeViewBox: false}],
					use: [optipng(), gifsicle(), jpegtran(), svgo()]
				}))
				.pipe(gulp.dest(path.dirname(imageFile)));
		break;
	}
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