(function () {
"use strict";

var
	gulp   = require('gulp'),
	assert = require('assert'),
	html   = require('../tasks/html'),
	helper = require('../lib/helper');

describe('tasks/html.js', function() {
	// Teardown
	after(function(done) {
		helper.removeFolder('test/html/dest', function() {
			done();
		});
	});

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
					assert.equal(data, '<div><div>foo</div></div>{=part.missing}');
					done();
				});
			})
		});

		it('should build html partials and prettify', function(done) {
			var
				h = html(gulp, {
					dir: {
						src: 'test/html/src',
						partials: 'test/html/modules',
						dest: 'test/html/dest'
					},
					html: {
						build: true,
						prettify: true,
						paths: {
							src: '*.html',
							dest: ''
						}
					}
				});

			h.htmlTask(function() {
				helper.readContentIfExists('test/html/dest/index.html', function(err, data) {
					assert.equal(data, "<div>\n  <div>foo</div>\n</div>{=part.missing}");
					done();
				});
			})
		});
	});
});
})();