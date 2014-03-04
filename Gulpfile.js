(function(){
	"use strict";

var 
	gulp = require('gulp'),
	jshint = require('gulp-jshint'),
	jshintStylish = require('jshint-stylish'),
	concat = require('gulp-concat'),
	prettify = require('gulp-prettify'),
	compass = require('gulp-compass'),
	partials = require('./lib/gulp-partials'),
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
	gulp.src(['./index.html'])
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
gulp.task('watch', ['scsswatch', 'jswatch']);

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
	startWatcher('all', 'scss', paths.compass.listen, 
		paths.compass.ignore, function (event, pathname){
		scssTask(event, pathname);
	});
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

// clean up if an error goes unhandled.
process.on('exit', function() {
	if (node) node.kill();
});
})();