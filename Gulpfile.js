(function(){
	"use strict";

var 
	gulp = require('gulp'),
	jshint = require('gulp-jshint'),
	jshintStylish = require('jshint-stylish'),
	concat = require('gulp-concat'),
	prettify = require('gulp-prettify'),
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
			'ignore': ['/main.', '/html', '/vendor', '.js']
		},
		'script': {
			'build': ['./js/**/*.js', './modules/**/*.js', '!js/main.js'],
			'listen': ['modules', 'js', 'lib'],
			'ignore': ['/main.', '/html', '/vendor', '.css']
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
gulp.task('watch', ['csswatch', 'jswatch']);

gulp.task('jswatch', function() {
	startWatcher('all', paths.script.listen, paths.script.ignore, function (event, pathname){
		jsTask(event, pathname);
	});
});

gulp.task('csswatch', function() {
	startWatcher('all', paths.style.listen, paths.style.ignore, function (event, pathname){
		cssTask(event, pathname);
	});
});

gulp.task('default', ['server', 'watch'], function(){
	// Start the server, if a change is detected restart it
	gulp.watch(paths.server, ['server']);
});

function startWatcher(event, paths, ignored, callback){
	/* This watcher will work even when entire directorys are copy-pasted */

	var
		ignoredRex = pathsToRex(ignored), // This is not the best way to handle the ignore pattern
		watcher = chokidar.watch(paths, {ignored: ignoredRex, persistent: true, ignoreInitial: true});

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