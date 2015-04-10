(function () {
"use strict";

var
	gulp = require('gulp'),
	assert = require('assert'),
	css = require('../tasks/css'),
	helper = require('../lib/helper');

describe('tasks/css.js', function() {
	describe('cssConcat', function() {

		it('should concatinate css files', function(done) {

			var
				c = css(gulp, {
					dir: {
						src: 'test/css'
					},
					css: {
						paths: {
							src: ['one.css', 'two.css'],
							dest: 'dest/main.css'
						}
					}
				});

			c.cssConcat(function() {
				helper.readContentIfExists('test/css/dest/main.css', function(err, data) {

					assert.equal(data, "body {\n\theight: 100px;\n}\nmain {\n\tbackground: rebeccapurple;\n}");
					done();
				});
			});
		});

		it('should concatinate and minify css files', function(done) {

			var
				c = css(gulp, {
					dir: {
						src: 'test/css',
						dest: 'test/css'
					},
					css: {
						minify: true,
						paths: {

							// The order of the files must be respected
							src: ['two.css', 'one.css'],
							dest: 'dest/build.css'
						}
					}
				});

			c.cssConcat(true, function() {
				helper.readContentIfExists('test/css/dest/build.min.css', function(err, data) {

					assert.equal(data, "main{background:#663399}body{height:100px}");
					done();
				});
			});
		});
	});
});
})();