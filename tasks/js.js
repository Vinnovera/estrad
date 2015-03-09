module.exports = function (gulp, options) {
	"use strict";

	var
		rjs           = require('gulp-requirejs'),
		jshint        = require('gulp-jshint'),
		jshintStylish = require('jshint-stylish'),
		uglify        = require('gulp-uglify'),
		rename        = require('gulp-rename'),
		gulpif        = require('gulp-if'),
		ignore        = require('gulp-ignore'),
		fs            = require('fs'),
		jRcExists     = fs.existsSync(process.cwd() + '/.jshintrc'),
		jshintRc      = (jRcExists) ? JSON.parse(fs.readFileSync(process.cwd() + '/.jshintrc', 'utf-8')) : JSON.parse(fs.readFileSync(__dirname + '/../.jshintrc', 'utf-8')),
		helper        = require('../lib/helper'),
		path          = require('path'),
		dir           = require('node-dir'),
		extend        = require('extend'),
		toSource      = require('tosource'),
		through2       = require('through2'),
		paths         = options.js.paths,
		jstimeout;

	gulp.task('estrad-js_watch', function() {
		if(!options.js.watch) return;

		helper.startWatcher(paths.listen, jsTask);

		requireConfigPaths();
	});

	gulp.task('estrad-js_build', ['estrad-clean_build'], function(cb) {
		var
			destDirPath = paths.dest;

		if(!options.js.build) return cb(null);

		// Dest is never a file
		if(path.extname(destDirPath)) destDirPath = path.dirname(destDirPath);

		// Run r.js if require.js path is defined
		if(paths.require) {
			requireConfigPaths(function() {
				helper.readContentIfExists('/' + paths.src, function(err, data) {
					var
						srcDirPath  = path.dirname(paths.src);

					if(err) return cb(err);

					helper.readContentIfExists('/' + srcDirPath + '/modulesPaths.js', function(err, modulesPathsData) {
						if(err) return cb(err);

						helper.writeFile('/.estrad/main.js', mergeRequireConfigPaths(data, modulesPathsData), function() {
							rjs({
								baseUrl: './' + srcDirPath,
								out: path.basename(paths.src) + path.extname(paths.src),
								name: path.basename(paths.src, '.js'),
								mainConfigFile: './.estrad/main.js',
								paths: {
									requireLib: path.relative(srcDirPath, path.dirname(paths.require)) + '/' + path.basename(paths.require, '.js')
								},
								include: 'requireLib'
							})
								.pipe(through2.obj(function(file, enc, next) {
									this.push(file);
									this.end();
									next();
								}))
								.pipe(gulp.dest(destDirPath))
								.pipe(gulpif(options.js.uglify, uglify(options.js.uglify), ignore.exclude(true)))
								.pipe(rename(function(path) {
									path.extname = '.min' + path.extname;
								}))
								.pipe(gulp.dest(destDirPath))
								.on('end', function() {
									cb();
								});

						});
					});
				});
			});

		} else {
			
			// Move and uglify javascipt files
			gulp.src(paths.src)
				.pipe(gulp.dest(destDirPath))
				.pipe(gulpif(options.js.uglify, uglify(options.js.uglify), ignore.exclude(true)))
				.pipe(rename(function(path) {
					path.extname = '.min.js';
				}))
				.pipe(gulp.dest(destDirPath))
				.on('end', function() {
					cb();
				});
		}
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
		if(!paths.require) return;
		
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
