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
	});
});
})();