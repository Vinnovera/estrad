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
		'server': ['./index.js', './lib/**/*.js'],
		'style': ['./css/**/*.css', './modules/**/*.css', '!css/main.css'],
		'script': ['./js/**/*.js', './modules/**/*.js', '!js/main.js']
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

gulp.task('build', function(){
	// Build html files
	gulp.src(['./index.html'])
		.pipe(partials())
		.pipe(prettify())
		.pipe(gulp.dest('./html/'));

	// Build CSS files
	jsconcat();

	// Build JS files
	cssconcat();
});

gulp.task('watch', function(){
	/* This watcher will work even when entire directorys are copy-pasted */
	var watcher = chokidar.watch(['js','modules', 'css'], {ignored: /\/main.|.DS_Store|\/html|\/vendor/, persistent: true, ignoreInitial: true});

	watcher.on('all', function (event, pathname){
		var ext = path.extname(pathname);

		console.log("[" + chalk.green(pkg.name) + "] File event " + chalk.cyan(event) + ": " + chalk.magenta(pathname));

		switch(ext) {
			case '':
				/* dir added or removed */
				csstask(event, pathname);
				jstask(event, pathname);
			break;
			case '.css':
				/* css file change */
				csstask(event, pathname);
			break;
			case '.js':
				/* js file change */
				jstask(event,pathname);
			break;
		}
	});

	process.on('exit', function() {
		watcher.close();
	});
});

gulp.task('default', ['server', 'watch'], function(){
	// Start the server, if a change is detected restart it
	gulp.watch(paths.server, ['server']);
});

function jstask(event, path) {
	switch(event) {
		case 'add':
			clearTimeout(jstimeout);
			jstimeout = setTimeout(function(){
				lint(paths.script);
				jsconcat();
			},10);
		break;
		case 'change':
			lint(path);
		case 'unlink':
			jsconcat();
		break;
	}
}

function lint(path) {
	return gulp.src(path)
		.pipe(jshint(jshintRc))
		.pipe(jshint.reporter(jshintStylish));
}

function jsconcat() {
	return gulp.src(paths.script)
		.pipe(concat('main.js'))
		.pipe(gulp.dest('./js/'));
}

function csstask(event, path) {
	switch(event) {
		case 'add':
			clearTimeout(csstimeout);
			csstimeout = setTimeout(function(){
				cssconcat();
			},10);
		break;
		case 'change':
		case 'unlink':
			cssconcat();
		break;
	}
}

function cssconcat() {
	return gulp.src(paths.style)
		.pipe(concat('main.css'))
		.pipe(gulp.dest('./css/'));
}

// clean up if an error goes unhandled.
process.on('exit', function() {
	if (node) node.kill();
});
})();