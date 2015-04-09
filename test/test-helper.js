(function() {
var
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
});

})();