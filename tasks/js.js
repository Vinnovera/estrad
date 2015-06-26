module.exports = function (gulp, o) {
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
		helper        = require('../lib/helper'),
		jRcExists     = fs.existsSync(helper.cwd('.jshintrc')),
		jshintRc      = (jRcExists) ? JSON.parse(fs.readFileSync(helper.cwd('.jshintrc'), 'utf-8')) : JSON.parse(fs.readFileSync(__dirname + '/../.jshintrc', 'utf-8')),
		path          = require('path'),
		dir           = require('node-dir'),
		extend        = require('extend'),
		toSource      = require('tosource'),
		through2      = require('through2'),
		concat        = require('gulp-concat'),
		paths         = o.js.paths,
		requireRex    = /require.config\(([\s\S]+?)\)/i,
		jstimeout;

	gulp.task('estrad-js_watch', function(callback) {
		var
			listenPath = helper.prependPath(o.dir.src, paths.listen);

		if(!o.js.watch) return callback();

		helper.startWatcher(listenPath, jsTask);

		requireConfigPaths(callback);
	});

	gulp.task('estrad-js_build', ['estrad-clean_build'], function(callback) {
		var
			destPath   = helper.prependPath(o.dir.dest, paths.dest),
			sourcePath = helper.prependPath(o.dir.src, paths.src);

		if(!o.js.build) return callback();

		// Dest is never a file
		if(path.extname(destPath)) destPath = path.dirname(destPath);

		// Run r.js if require.js path is defined
		if(paths.require) {
			requireConfigPaths(function() {
				helper.readContentIfExists(sourcePath, function(err, data) {
					var
						srcDirPath  = path.dirname(sourcePath);

					if(err) return callback(err);

					helper.readContentIfExists(srcDirPath + '/modulesPaths.js', function(err, modulesPathsData) {
						if(err) return callback(err);

						helper.writeFile('/.estrad/main.js', mergeRequireConfigPaths(data, modulesPathsData), function() {
							var
								requirePath = helper.prependPath(o.dir.src, paths.require);

							rjs({
								baseUrl: './' + srcDirPath,
								out: path.basename(sourcePath),
								name: path.basename(sourcePath, '.js'),
								mainConfigFile: './.estrad/main.js',
								paths: {
									requireLib: path.relative(srcDirPath, path.dirname(requirePath) + '/') + path.basename(requirePath, '.js')
								},
								include: 'requireLib'
							})

								// Fix gulp-requirejs end event bug
								.pipe(through2.obj(function(file, enc, next) {
									this.push(file);
									this.end();
									next();
								}))
								.pipe(gulp.dest(destPath))
								.pipe(gulpif(o.js.uglify, uglify(o.js.uglify), ignore.exclude(true)))
								.pipe(rename(function(path) {
									path.extname = '.min' + path.extname;
								}))
								.pipe(gulp.dest(destPath))
								.on('end', function() {
									callback();
								});
						});
					});
				});
			});

		} else {
			// Move and uglify javascipt files
			gulp.src(sourcePath)
				.pipe(gulp.dest(destPath))
				.pipe(gulpif(o.js.concat, concat(path.basename(paths.dest))))
				.pipe(gulpif(o.js.uglify, uglify(o.js.uglify), ignore.exclude(true)))
				.pipe(rename(function(path) {
					path.extname = '.min.js';
				}))
				.pipe(gulp.dest(destPath))
				.on('end', function() {
					callback();
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
			.pipe(jshint(extend({}, jshintRc)))
			.pipe(jshint.reporter(jshintStylish));
	}

	function requireConfigPaths(callback) {
		var dirPath;

		callback = callback || function() {};

		if(!paths.require || !paths.dir) return callback();
		
		dirPath = helper.prependPath(o.dir.src, paths.dir);

		dir.files(helper.cwd(dirPath), function(err, files) {
			var
				srcPath = helper.prependPath(o.dir.src, path.dirname(paths.src)),
				requirePaths = {},
				fileContent;

			if (err) return callback(err);

			files
				.filter(function(item) {
					return (path.extname(item) === '.js');
				})
				.map(function(item) {
					var
						fileName     = path.basename(item, '.js'),
						dirname      = path.dirname(item),
						relativePath = path.relative(srcPath, dirname);

					if(relativePath) relativePath += '/';

					requirePaths[fileName] = relativePath + fileName;
				});

			fileContent = 'require.config({paths:' + JSON.stringify(requirePaths) + '});';

			helper.writeFile(srcPath + '/modulesPaths.js', fileContent, callback);
		});
	}

	function mergeRequireConfigPaths(file1, file2) {
		var
			obj1   = findRequireConfig(file1),
			obj2   = findRequireConfig(file2),
			result = file1;

		if('paths' in obj1 && 'paths' in obj2) {
			obj1.paths = extend(obj1.paths, obj2.paths);

			result = file1.replace(requireRex, 'require.config(' + toSource(obj1, null, false) + ')');

		} else if ('paths' in obj2) {
			obj1.paths = obj2.paths;

			if(requireRex.test(file1)) {
				result = file1.replace(requireRex, 'require.config(' + toSource(obj1, null, false) + ')');

			} else {
				obj1 = {
					paths: obj2.paths
				};

				result = 'require.config(' + (toSource(obj1, null, false) + ');\n' + file1);
			}
		}

		return result;
	}

	function findRequireConfig(data) {
		var
			match  = requireRex.exec(data),
			result = {};

		if(match) {
			result = eval('(' + match[1] + ')');
		}

		return result;
	}

	// Make accessable for testing
	return {
		requireConfigPaths: requireConfigPaths,
		mergeRequireConfigPaths: mergeRequireConfigPaths,
		findRequireConfig: findRequireConfig
	};
};
