module.exports = function (gulp, options) {
	"use strict";

	var
		jshint        = require('gulp-jshint'),
		jshintStylish = require('jshint-stylish'),
		fs            = require('fs'),
		jRcExists     = fs.existsSync(process.cwd() + '/.jshintrc'),
		jshintRc      = (jRcExists) ? JSON.parse(fs.readFileSync(process.cwd() + '/.jshintrc', 'utf-8')) : JSON.parse(fs.readFileSync(__dirname + '/../.jshintrc', 'utf-8')),
		helper        = require('../lib/helper'),
		paths         = options.paths,
		jstimeout;

	gulp.task('estrad-js_watch', function() {
		if(!options.watch) return;

		helper.startWatcher(paths.listen, jsTask);
	});

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
			break;
			case 'unlink':
			break;
		}
	}

	function jsLint(path) {
		return gulp.src(path)
			.pipe(jshint(jshintRc))
			.pipe(jshint.reporter(jshintStylish));
	}
};