module.exports = function (gulp, options) {
	"use strict";

	var
		rjs           = require('gulp-requirejs'),
		jshint        = require('gulp-jshint'),
		jshintStylish = require('jshint-stylish'),
		fs            = require('fs'),
		jRcExists     = fs.existsSync(process.cwd() + '/.jshintrc'),
		jshintRc      = (jRcExists) ? JSON.parse(fs.readFileSync(process.cwd() + '/.jshintrc', 'utf-8')) : JSON.parse(fs.readFileSync(__dirname + '/../.jshintrc', 'utf-8')),
		helper        = require('../lib/helper'),
		path          = require('path'),
		dir           = require('node-dir'),
		chalk         = require('chalk'),
		paths         = options.js.paths,
		jstimeout;

	gulp.task('estrad-js_watch', function() {
		if(!options.js.watch) return;

		helper.startWatcher(paths.listen, jsTask);

		requireJSpaths();
	});

	gulp.task('estrad-js_build', function() {

		if(!options.js.build) return;

		rjs({
			baseUrl: './' + path.dirname(paths.src),
			out: path.basename(paths.dest),
			name: path.basename(paths.src, '.js'),
			mainConfigFile: paths.src,
			paths: {
				requireLib: path.relative(path.dirname(paths.src), path.dirname(paths.require)) + '/' + path.basename(paths.require, '.js')
			},
			include: 'requireLib'
		})
			.pipe(gulp.dest(path.dirname(paths.dest)));
	});

	function jsTask(event, path) {
		switch(event) {
			case 'add':
				clearTimeout(jstimeout);
				jstimeout = setTimeout(function() {
					jsLint(path);
					requireJSpaths();
				}, 10);
			break;
			case 'change':
				jsLint(path);
			break;
			case 'unlink':
				requireJSpaths();
			break;
		}
	}

	function jsLint(path) {
		return gulp.src(path)
			.pipe(jshint(jshintRc))
			.pipe(jshint.reporter(jshintStylish));
	}

	function requireJSpaths() {
		dir.files(process.cwd() + '/' + options.modulesDir, function(err, files) {
			var
				requirePaths = {},
				fileContent;

			if (err) throw err;

			files
				.filter(function(item) {
					return (path.extname(item) === '.js');
				})
				.map(function(item) {
					requirePaths[path.basename(item, '.js')] = path.relative(path.dirname(paths.src), path.dirname(item)) + '/' + path.basename(item, '.js')
				});

			fileContent = 'require.config({paths:' + JSON.stringify(requirePaths) + '});'

			fs.writeFile(process.cwd() + '/' + path.dirname(paths.src) + '/modulesPaths.js', fileContent, function(err) {
				if(err) throw err;

				console.log("["+ chalk.green("estrad") + "] Saving: " + chalk.magenta(path.dirname(paths.src) + '/modulesPaths.js'));
			});
		});
	}
};