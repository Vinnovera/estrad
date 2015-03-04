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
		extend        = require('extend'),
		toSource      = require('tosource'),
		through       = require('through2'),
		paths         = options.js.paths,
		jstimeout;

	gulp.task('estrad-js_watch', function() {
		if(!options.js.watch) return;

		helper.startWatcher(paths.listen, jsTask);

		requireConfigPaths();
	});

	gulp.task('estrad-js_build', ['estrad-clean_build'], function(cb) {

		if(!options.js.build) return cb(null);

		requireConfigPaths(function() {
			helper.readContentIfExists('/' + paths.src, function(err, data) {
				var
					srcDirPath = path.dirname(paths.src);

				if(err) return cb(err);

				helper.readContentIfExists('/' + srcDirPath + '/modulesPaths.js', function(err, modulesPathsData) {
					if(err) return cb(err);

					helper.writeFile('/.estrad/main.js', mergeRequireConfigPaths(data, modulesPathsData), function() {
						rjs({
							baseUrl: './' + srcDirPath,
							out: path.basename(paths.dest),
							name: path.basename(paths.src, '.js'),
							mainConfigFile: './.estrad/main.js',
							paths: {
								requireLib: path.relative(srcDirPath, path.dirname(paths.require)) + '/' + path.basename(paths.require, '.js')
							},
							include: 'requireLib'
						})
							.pipe(through.obj(function(file, enc, next) {
								this.push(file);
								this.end();
								next();
							}))
							.pipe(gulp.dest(path.dirname(paths.dest)))
							.on('end', function() {
								cb();
							});

					});
				});
			});
		});
	});

	function jsTask(event, path) {
		switch(event) {
			case 'add':
				clearTimeout(jstimeout);
				jstimeout = setTimeout(function() {
					jsLint(path);
					requireConfigPaths();
				}, 10);
			break;
			case 'change':
				jsLint(path);
			break;
			case 'unlink':
				requireConfigPaths();
			break;
		}
	}

	function jsLint(path) {
		return gulp.src(path)
			.pipe(jshint(jshintRc))
			.pipe(jshint.reporter(jshintStylish));
	}

	function requireConfigPaths(callback) {
		dir.files(process.cwd() + '/' + options.modulesDir, function(err, files) {
			var
				srcDirPath = path.dirname(paths.src),
				requirePaths = {},
				fileContent;

			if (err) throw err;

			files
				.filter(function(item) {
					return (path.extname(item) === '.js');
				})
				.map(function(item) {
					var
						fileName = path.basename(item, '.js');

					requirePaths[fileName] = path.relative(srcDirPath, path.dirname(item)) + '/' + fileName;
				});

			fileContent = 'require.config( { paths:' + JSON.stringify(requirePaths) + '});';

			helper.writeFile('/' + srcDirPath + '/modulesPaths.js', fileContent, callback);
		});
	}

	function mergeRequireConfigPaths(file1, file2) {
		var
			rex = /require.config\(([\s\S]+?)\)/i,
			match = rex.exec(file1),
			obj1 = {},
			obj2 = {},
			result;

		if(match) {
			obj1 = eval('(' + match[1] + ')');
		}

		match = rex.exec(file2);

		// The second file, if it at all exists, should be guaratneed to have a match
		if(match) {
			obj2 = eval('(' + match[1] + ')');
		}

		if('paths' in obj1 && 'paths' in obj2) {
			obj1.paths = extend(obj1.paths, obj2.paths);

			result = file1.replace(rex, 'require.config(' + toSource(obj1) + ');');

			return result;
		}

		return file1;
	}
};