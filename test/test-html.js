(function () {
"use strict";

var
	gulp   = require('gulp'),
	assert = require('assert'),
	html   = require('../tasks/html'),
	helper = require('../lib/helper');

describe('tasks/html.js', function() {
	describe('htmlTask', function() {

		it('should build html partials', function(done) {
			var
				h = html(gulp, {
					dir: {
						src: 'test/html/src',
						partials: 'test/html/modules',
						dest: 'test/html/dest'
					},
					html: {
						build: true,
						paths: {
							src: '*.html',
							dest: ''
						}
					}
				});

			h.htmlTask(function() {
				helper.readContentIfExists('test/html/dest/index.html', function(err, data) {
					assert.equal(data, '<div>foo</div>{=part.missing}');
					done();
				});
			})
		});
	});
});
})();