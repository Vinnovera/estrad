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
});

})();