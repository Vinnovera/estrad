(function () {
"use strict";

var
	assert = require('assert'),
	url    = require('url'),
	proxy  = require('../lib/proxy');

describe('lib/proxy.js', function() {

	describe('handleMatch', function() {
		it('should return the url to proxy to', function(done) {
			var
				reqUrl = url.parse('http://localhost/that/very/cool/json');

			proxy.handleMatch('', reqUrl, '/routes.json', function(err, reqUrl, target) {

				assert.equal(target, 'http://localhost/routes.json');
				assert.equal(reqUrl, '/routes.json');

				done();
			});
		});

		it('should return the url to proxy to with requested query', function(done) {
			var
				reqUrl = url.parse('http://localhost/that/very/cool/json?foo=bar');

			proxy.handleMatch('', reqUrl, '/routes.json', function(err, reqUrl, target) {

				assert.equal(target, 'http://localhost/routes.json?foo=bar');
				assert.equal(reqUrl, '/routes.json?foo=bar');

				done();
			});
		});

		it('should return the url to proxy to with added query', function(done) {
			var
				reqUrl = url.parse('http://localhost/override/query');

			proxy.handleMatch('', reqUrl, '/always/with?this=query', function(err, reqUrl, target) {

				assert.equal(target, 'http://localhost/always/with?this=query');
				assert.equal(reqUrl, '/always/with?this=query');

				done();
			});
		});

		it('should return the url to proxy to with query intact', function(done) {
			var
				reqUrl = url.parse('http://localhost/override/query?foo=bar');

			proxy.handleMatch('', reqUrl, '/always/with?this=query', function(err, reqUrl, target) {

				assert.equal(target, 'http://localhost/always/with?foo=bar');
				assert.equal(reqUrl, '/always/with?foo=bar');

				done();
			});
		});
	});

	describe('getProxyUrl', function() {
		it('should return error', function(done) {
			var
				reqUrl = url.parse('http://localhost/');

			proxy.getProxyUrl({url: reqUrl}, function(err) {
				assert.equal(err, true);

				done();
			})
		});

		it('should return matched target', function(done) {
			var
				reqUrl = url.parse('http://localhost/different/domain');

			proxy.getProxyUrl({url: reqUrl}, function(err, target) {
				assert.equal(target, 'https://www.example.com/');

				done();
			})
		});

		it('should return matched target with wildcard', function(done) {
			var
				reqUrl = url.parse('http://localhost/wildcard/123/test.jpg');

			proxy.getProxyUrl({url: reqUrl}, function(err, target) {
				assert.equal(target, 'https://www.example.com/123/test.jpg');

				done();
			})
		});

		it('should return matched target with wildcard and with specified extension', function(done) {
			var
				reqUrl = url.parse('http://localhost/wildcard/extension/123/test.jpg');

			proxy.getProxyUrl({url: reqUrl}, function(err, target) {
				assert.equal(target, 'https://www.example.com/123/test.jpg');

				done();
			})
		});
	});
});
})();