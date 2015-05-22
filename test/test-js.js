(function () {
"use strict";

var
	gulp   = require('gulp'),
	fs     = require('fs'),
	assert = require('assert'),
	js     = require('../tasks/js'),
	helper = require('../lib/helper');


describe('tasks/js.js', function() {

	// Teardown
	after(function(done) {
		helper.removeFolder('test/js/dest', function() {
			done();
		});
	});

	describe('findRequireConfig', function() {

		it('should return an empty object if require.config is not found', function() {
			var 
				j      = js(gulp, {
					js: {
						paths: {}
					}
				}),
				result = j.findRequireConfig('');

			assert.deepEqual(result, {});
		});

		it('should return the argument of require.config as object', function(done) {
			helper.readContent('/test/js/findRequireConfig.js', function(err, data) {
				var 
					j      = js(gulp, {
						js: {
							paths: {}
						}
					}),
					result = j.findRequireConfig(data);

				assert.deepEqual(result, { 
					paths: {},
					foo: 'bar'
				});

				done();
			});
		});
	});

	describe('mergeRequireConfigPaths', function() {

		it('should return value unchanged when no require.config is set', function() {
			var 
				j      = js(gulp, {
					js: {
						paths: {}
					}
				}),
				value  = 'test',
				result = j.mergeRequireConfigPaths(value, 'should not affect');

			assert.equal(result, value);
		});

		it('should merge require.config.paths from both arguments', function() {
			var 
				j      = js(gulp, {
					js: {
						paths: {}
					}
				}),
				result = j.mergeRequireConfigPaths('require.config({paths:{foo:"bar"},foo:"bar"});', 'require.config({paths:{bar:"baz"},bar:"baz"});');

			assert.equal(result, 'require.config({paths:{foo:"bar",bar:"baz"},foo:"bar"});');
		});

		it('should add require.config.paths from second argument to first', function() {
			var 
				j      = js(gulp, {
					js: {
						paths: {}
					}
				}),
				result = j.mergeRequireConfigPaths('require.config({foo:"bar"});', 'require.config({paths:{bar:"baz"},bar:"baz"});');

			assert.equal(result, 'require.config({foo:"bar",paths:{bar:"baz"}});');

		});

		it('should add require.config to first argument', function() {
			var 
				j      = js(gulp, {
					js: {
						paths: {}
					}
				}),
				result = j.mergeRequireConfigPaths('test', 'require.config({paths:{bar:"baz"},bar:"baz"});');

			assert.equal(result, 'require.config({paths:{bar:"baz"}});\ntest');

		});
	});

	describe('requireConfigPaths', function() {

		it('should create modulesPaths.js', function(done) {
			var 
				j = js(gulp, {
					dir: {
						src: 'test/js',
						partials: 'test/js/empty-modules'
					},
					js: {
						paths: {
							src: '/dest/main.js',
							require: true
						}
					}
				});

			j.requireConfigPaths(function() {
				fs.exists(process.cwd() + '/test/js/dest/modulesPaths.js', function(exists) {
					assert.equal(exists, true);

					done();
				});
			});
		});

		it('should create modulesPaths.js with aliases for javascript files in the partials folder', function(done) {
			var 
				j = js(gulp, {
					dir: {
						src: 'test/js',
						partials: 'test/js/modules'
					},
					js: {
						paths: {
							src: '/dest/main.js',
							require: true
						}
					}
				});

			j.requireConfigPaths(function() {
				helper.readContentIfExists('/test/js/dest/modulesPaths.js', function(err, data) {
					if(err) throw err;

					assert.equal(data, 'require.config({paths:{\"module\":\"../modules/module\"}});')

					done();
				});
			});
		});
	});
});

})();