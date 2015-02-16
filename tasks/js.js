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
		paths         = options.js.paths,
		jstimeout;

	gulp.task('estrad-js_watch', function() {
		if(!options.js.watch) return;

		helper.startWatcher(paths.listen, jsTask);

		requireJSpaths();
	});

	gulp.task('estrad-js_build', function() {

		if(!options.js.build) return;

		requireJSpaths(function(){
			helper.readContentIfExists('/' + paths.src, function(err, data) {
				if(err) throw err;

				helper.readContentIfExists('/' + path.dirname(paths.src) + '/modulesPaths.js', function(err, modulesPathsData) {
					if(err) throw err;

					helper.writeFile('/.estrad/main.js', mergeFilePaths(data, modulesPathsData), function() {

						console.log(path.relative(path.dirname(paths.src), path.dirname('./.estrad/main.js')) + '/' + path.basename('./.estrad/main.js', '.js'));

						rjs({
							baseUrl: './' + path.dirname(paths.src),
							out: path.basename(paths.dest),
							name: path.basename(paths.src, '.js'),
							mainConfigFile: './.estrad/main.js',
							paths: {
								requireLib: path.relative(path.dirname(paths.src), path.dirname(paths.require)) + '/' + path.basename(paths.require, '.js')
							},
							include: 'requireLib'
						})
							.pipe(gulp.dest(path.dirname(paths.dest)));

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

	function requireJSpaths(callback) {
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

			fileContent = 'require.config( { paths:' + JSON.stringify(requirePaths) + '});'

			helper.writeFile('/' + path.dirname(paths.src) + '/modulesPaths.js', fileContent, callback);
		});
	}

	function mergeFilePaths(file1, file2) {
		var
			rex = /require.config\(([\s\S]+?)\)/i,
			match = rex.exec(file1),
			obj1 = {},
			obj2 = {},
			result;

		if(match) {
			obj1 = eval('(' + match[1] + ')');
		}

		match = rex.exec(file2)
		// The second file, if it at all exists, should be guaratneed to have a match
		if(match) {
			obj2 = eval('(' + match[1] + ')');
		}

		if('paths' in obj1 && 'paths' in obj2) {
			obj1.paths = extend(obj1.paths, obj2.paths);

			result = file1.replace(rex, 'require.config(' + toSource(obj1) + ');');

			console.log(result);
			return result;
		}

		return file1;
	}
};