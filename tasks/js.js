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

	gulp.task('estrad-jswatch', function() {
		if(!options.watch.js) return;

		helper.startWatcher(paths.script.listen, jsTask);
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
			case 'unlink':
			break;
		}
	}

	function jsLint(path) {
		if(!options.task.js.jshint) return;

		return gulp.src(path)
			.pipe(jshint(jshintRc))
			.pipe(jshint.reporter(jshintStylish));
	}
};