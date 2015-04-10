(function () {
"use strict";

var
	fs     = require('fs'),
	gulp   = require('gulp'),
	assert = require('assert'),
	stat   = require('../tasks/static'),
	helper = require('../lib/helper');


describe('tasks/static.js', function() {
	// Teardown
	after(function(done) {
		helper.removeFolder('test/static/dest', function() {
			done();
		});
	});

	describe('staticTask', function() {

		it('should move static files between folders', function(done) {
			var
				s = stat(gulp, {
					dir: {
						src: 'test/static',
						dest: 'test/static/dest'
					},
					static: {
						build: true,
						paths: {
							src: ['*.js'],
							dest: ''
						}
					}
				});

			s.staticTask(function() {
				fs.exists(process.cwd() + '/test/static/dest/main.js', function(exists) {
					assert.equal(exists, true, 'failed to move file');

					fs.exists(process.cwd() + '/test/static/dest/main.css', function(exists) {
						assert.equal(exists, false, 'moved file it souldn\'t');

						done();
					});
				});
			}); 
		});
	});
});

})();