/**
 * This file has a wonky name to make sure it's run first as the other
 * tests use the helper methods
 */

(function() {
"use strict";

var
	fs     = require('fs'),
	assert = require('assert'),
	helper = require('../lib/helper');

describe('lib/helper.js', function() {
	describe('readContent', function() {

		it('should read file content', function(done) {
			helper.readContent('/test/helper/readContent.txt', function(err, data) {
				assert.equal(data, 'foo');
				done();
			});
		});
	});

	describe('readContentIfExists', function() {

		it('should return error if file is missing', function(done) {
			helper.readContentIfExists('/test/helper/missingFile.txt', function(err) {
				assert.equal(err instanceof Error, true);
				done();
			});
		});

		it('should read file content', function(done) {
			helper.readContentIfExists('/test/helper/readContentIfExists.txt', function(err, data) {
				assert.equal(data, 'foo');
				done();
			});
		});
	});

	describe('extendDefaultOptions', function() {

		it('default options sanity check', function(done) {
			var 
				options = helper.extendDefaultOptions();

			assert.equal(options.dir.src, '/');
			assert.equal(options.dir.build, '/');
			assert.equal(options.dir.partials, '/');

			assert.equal(options.css.watch, false);
			assert.equal(options.css.build, false);
			assert.equal(options.css.preprocessor, false);

			assert.equal(options.js.watch, false);
			assert.equal(options.js.build, false);

			assert.equal(options.html.build, false);

			assert.equal(options.images.watch, false);
			assert.equal(options.images.build, false);

			assert.equal(options.server.start, false);
			assert.equal(options.server.proxy, false);

			assert.equal(options.static.build, false);
			done();
		});


		it('should extend default options', function(done) {
			var
				options = helper.extendDefaultOptions({
					css: {
						paths: {
							src: [
								'/css/**/*.css'
							]
						}
					}
				});


			assert.deepEqual(options.css.paths, {
				listen: [],
				src: [
					'/css/**/*.css'
				],
				dest: ''
			});

			done();
		});
	});

	describe('cwd', function() {

		it('should prepend process.cwd', function(done) {
			var path = helper.cwd('path', 'to', 'file.txt');

			assert.equal(path, process.cwd() + '/path/to/file.txt');

			done();
		});
	});

	describe('prependPath', function() {

		it('should prepend string to path', function(done) {
			var
				path = helper.prependPath('root', 'path/to/file.txt');

			assert.equal(path, 'root/path/to/file.txt');

			done();
		});

		it('should prepend string to paths in array', function(done) {
			var
				paths = helper.prependPath('root/', ['path/to/file.txt', 'path/to/otherFile.txt']);

			assert.deepEqual(paths, ['root/path/to/file.txt', 'root/path/to/otherFile.txt']);

			done();
		});
	});

	describe('removeFolder', function() {
		fs.mkdir('test/helper/dest', function(err) {

			it('should remove folder', function(done) {
				assert.equal(err instanceof Error, false);

				if(err) throw err;

				helper.removeFolder('test/helper/dest', function() {
					fs.exists(process.cwd() + '/test/helper/dest', function(exists) {
						assert.equal(exists, false);

						done();
					});
				});
			});
		});
	});
});

})();