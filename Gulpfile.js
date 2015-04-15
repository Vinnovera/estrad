(function () {
	"use strict";

	var
		gulp      = require("gulp"),
		jshint    = require("gulp-jshint"),
		jhStylish = require("jshint-stylish"),
		chokidar  = require("glob-chokidar"),
		chalk     = require("chalk"),
		fs        = require("fs"),
		stylus    = require("stylus"),
		jshintrc  = JSON.parse(fs.readFileSync("./.jshintrc", "utf-8")),
		paths     = {
			js: {
				listen: ["*.js", "lib/**/*.js", "tasks/**/*.js", "test/**/*.js"]
			}
		};

	require("./gulpfile-extend")(gulp, {
		dir: {
			src: 'src',
			partials: 'src/modules',
			dest: 'package'
		},
		css: {
			watch: true,
			build: true,
			preprocessor: 'stylus',
			settings: {
				define: {
					url: stylus.url()
				}
			},
			paths: {
				src: 'styl/*.styl',
				listen: [
					'styl/**/*.styl'
				],
				dest: 'css/'
			}
		},
		js: {
			watch: true,
			build: true,
			uglify: true,
			paths: {
				require: 'js/require.js',
				src: [
					'js/main.js'
				],
				listen: [
					'js/**/*.js'
				],
				dest: 'js/'
			}
		},
		server: {
			start: true
		}
	});

	gulp.task("jswatch", function() {
		chokidar(paths.js.listen, function(ev, path) {
			console.log("[" + chalk.green("glob-chokidar") + "] File event '" + chalk.cyan(ev) + "' in file: " + chalk.magenta(path));

			gulp.src(path)
				.pipe(jshint(jshintrc))
				.pipe(jshint.reporter(jhStylish));
		});
	});

	gulp.task("watch", ["jswatch"]);

	gulp.task("default", ["watch"]);

	gulp.task("test", ["estrad"]);
	gulp.task("test-build", ["estrad-build"]);

})();