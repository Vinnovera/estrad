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

	chokidar = require('chokidar'),
	chalk = require('chalk'),
	path = require("path"),
	spawn = require('child_process').spawn,
	fs = require('fs'),
	jshintRc = JSON.parse(fs.readFileSync('./.jshintrc', 'utf-8')),
	pkg = JSON.parse(fs.readFileSync('./package.json')),
	paths = {
		'server': ['./index.js', './lib/**/*.js', 'routes.json'],
		'style': {
			'build': ['./css/**/*.css', './modules/**/*.css', '!css/main.css'],
			'listen': ['modules', 'css'],
			'ignore': ['/main.', '/html', '/vendor']
		},
		'script': {
			'build': ['./js/**/*.js', './modules/**/*.js', '!js/main.js'],
			'listen': ['modules', 'js', 'lib'],
			'ignore': ['/main.', '/html', '/vendor']
		},
		'compass': {
			'build': ['./modules', './scss'],
			'listen': ['modules', 'scss'],
			'ignore': []
		},
		'svg2png': {
			'listen': ['img'],
			'ignore': []
		},
		'image': {
			'listen': ['img'],
			'ignore': []
		}
	},
	node, jstimeout, csstimeout, scsstimeout;

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

gulp.task('build', function(){
	// Build html files
	gulp.src(['./index.html', './pages/**/*.html'])
		.pipe(partials())
		.pipe(prettify())
		.pipe(gulp.dest('./html/'));

	// Build CSS files
	jsConcat();

	// Build JS files
	cssConcat();
});

/**
 * Watch
 */
gulp.task('watch', ['csswatch', 'jswatch', 'svgwatch', 'imagewatch']);

gulp.task('jswatch', function() {
	startWatcher('all', 'js', paths.script.listen, paths.script.ignore, function (event, pathname){
		jsTask(event, pathname);
	});
});

gulp.task('csswatch', function() {
	startWatcher('all', 'css', paths.style.listen, 
		paths.style.ignore, function (event, pathname){
		cssTask(event, pathname);
	});
});

gulp.task('scsswatch', function() {
	if(compass) compass.kill();
	compass =  spawn('compass', ['watch'], {stdio: 'inherit'});

	/*startWatcher('all', 'scss', paths.compass.listen, 
		paths.compass.ignore, function (event, pathname){
		scssTask(event, pathname);
	});*/
});

gulp.task('svgwatch', function() {
	startWatcher('all', 'svg', paths.svg2png.listen, paths.svg2png.ignore, svg2pngTask);
});

gulp.task('imagewatch', function() {
	startWatcher('all', 'jpg', paths.image.listen, paths.image.ignore, imageTask);
	startWatcher('all', 'gif', paths.image.listen, paths.image.ignore, imageTask);
	startWatcher('all', 'png', paths.image.listen, paths.image.ignore, imageTask);
	startWatcher('all', 'svg', paths.image.listen, paths.image.ignore, imageTask);
});

gulp.task('default', ['server', 'watch'], function(){
	// Start the server, if a change is detected restart it
	gulp.watch(paths.server, ['server']);
});

function startWatcher(event, ext, paths, ignored, callback){
	/* This watcher will work even when entire directorys are copy-pasted */

	var
		ignoredRex = pathsToRex(ignored),
		extRex = new RegExp('.' + ext + '$'),
		watcher = chokidar.watch(paths, {ignored: function(filepath){
			var result = ignoredRex.test(filepath);
		
			if(!result && path.extname(filepath)) {
				return !extRex.test(path.basename(filepath));
			} else return result;
		}, persistent: true, ignoreInitial: true});

	watcher.on(event, function(event, pathname) {
		console.log("[" + chalk.green(pkg.name) + "] File event " + chalk.cyan(event) + ": " + chalk.magenta(pathname));

		callback(event, pathname);
	});

	process.on('exit', function() {
		watcher.close();
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
				jsLint(paths.script.build);
				jsConcat();
			},10);
		break;
		case 'change':
			jsLint(path);
		case 'unlink':
			jsConcat();
		break;
	}
}

function jsLint(path) {
	return gulp.src(path)
		.pipe(jshint(jshintRc))
		.pipe(jshint.reporter(jshintStylish));
}

function jsConcat() {
	return gulp.src(paths.script.build)
		.pipe(concat('main.js'))
		.pipe(gulp.dest('./js/'));
}

/* CSS */
function cssTask(event, path) {
	switch(event) {
		case 'add':
			clearTimeout(csstimeout);
			csstimeout = setTimeout(function(){
				cssConcat();
			},10);
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

function scssTask(event, path) {
	switch(event) {
		case 'add':
			clearTimeout(scsstimeout);
			scsstimeout = setTimeout(function(){
				scssCompass();
			},10);
		break;
		case 'change':
		case 'unlink':
			scssCompass();
		break;
	}
}

function scssCompass() {
	gulp.src('./scss/**/*.scss')
		.pipe(compass({
			config: './config.rb',
			css: 'css',
			sass: 'scss'
		}))
		.on('error', function(err){
			console.log(err.message);
		});
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

/* Transform an array with paths to a regex */
function pathsToRex(ignored) {
	var 
		baseIgnore = ['.DS_Store', '.zip'],
		rex = '';

	if(!ignored) ignored = [];

	rex = baseIgnore.concat(ignored).join('|');

	return new RegExp(rex);
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