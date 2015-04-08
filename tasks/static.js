module.exports = function(gulp, o) {
	"use strict";

	var
		helper = require('../lib/helper');

	gulp.task('estrad-static_build', ['estrad-clean_build'], function() {
		if(!o.static.build) return;

		gulp.src(o.static.paths.src, { base: helper.cwd(o.dir.src) })
			.pipe(gulp.dest(o.static.paths.dest));
	});
};