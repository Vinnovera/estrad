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
		helper        = require('../lib/helper'),
		jRcExists     = fs.existsSync(helper.cwd('.jshintrc')),
		jshintRc      = (jRcExists) ? JSON.parse(fs.readFileSync(helper.cwd('.jshintrc'), 'utf-8')) : JSON.parse(fs.readFileSync(__dirname + '/../.jshintrc', 'utf-8')),
		path          = require('path'),
		dir           = require('node-dir'),
		extend        = require('extend'),
		toSource      = require('tosource'),
		through2       = require('through2'),
		paths         = options.js.paths,
		jstimeout;

	gulp.task('estrad-js_watch', function() {
		var
			listenPath = helper.prependPath(options.dir.src, paths.listen);

		if(!options.js.watch) return;

		helper.startWatcher(listenPath, jsTask);

		requireConfigPaths();
	});

	gulp.task('estrad-js_build', ['estrad-clean_build'], function(cb) {
		var
			destPath   = helper.prependPath(options.dir.src, paths.dest),
			sourcePath = helper.prependPath(options.dir.src, paths.src);

		if(!options.js.build) return cb(null);

		// Dest is never a file
		if(path.extname(destPath)) destPath = path.dirname(destPath);

		// Run r.js if require.js path is defined
		if(paths.require) {
			requireConfigPaths(function() {
				helper.readContentIfExists(sourcePath, function(err, data) {
					var
						srcDirPath  = path.dirname(sourcePath);

					if(err) return cb(err);

					helper.readContentIfExists(srcDirPath + '/modulesPaths.js', function(err, modulesPathsData) {
						if(err) return cb(err);

						helper.writeFile('/.estrad/main.js', mergeRequireConfigPaths(data, modulesPathsData), function() {
							var
								requirePath = helper.prependPath(options.dir.src, paths.require);

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
								.pipe(gulpif(options.js.uglify, uglify(options.js.uglify), ignore.exclude(true)))
								.pipe(rename(function(path) {
									path.extname = '.min' + path.extname;
								}))
								.pipe(gulp.dest(destPath))
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
		
		dir.files(helper.cwd(options.modulesDir), function(err, files) {
			var
				srcPath = helper.prependPath(options.dir.src, path.dirname(paths.src)),
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

					requirePaths[fileName] = path.relative(srcPath, path.dirname(item)) + '/' + fileName;
				});

			fileContent = 'require.config({ paths:' + JSON.stringify(requirePaths) + ' });';

			helper.writeFile(srcPath + '/modulesPaths.js', fileContent, callback);
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

			return file1.replace(rex, 'require.config(' + toSource(obj1) + ');');

		} else if ('paths' in obj2) {

			return 'require.config(' + (toSource(obj2) + ');' + file1);
		}

		return file1;
	}
};
