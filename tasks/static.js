module.exports = function(gulp, o) {
	"use strict";

	var
		helper = require('../lib/helper'),
		paths  = o.static.paths;

	gulp.task('estrad-static_build', ['estrad-clean_build'], staticTask);

	function staticTask(callback) {
		var
			sourcePath = helper.prependPath(o.dir.src, paths.src),
			destPath   = helper.prependPath(o.dir.dest, paths.dest),
			stream;

		if(!o.static.build) return callback();

		stream = gulp.src(sourcePath)
			.pipe(gulp.dest(destPath));

		stream.on('end', callback);
		stream.on('error', callback);
	}

	return {
		staticTask: staticTask
	};
};