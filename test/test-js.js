(function () {
"use strict";

var
	gulp   = require('gulp'),
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
});

})();