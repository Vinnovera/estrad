/**
 * Proof of concept
 */

(function(){
	"use strict";

	var
		app = require("http").createServer(handler),
		fs = require("fs"),
		doT = require("dot");

	app.listen(8080);

	function handler(req, res) {
		var requestedFile = checkPage(req.url);

		doT.templateSettings.varname = 'part';

		if(requestedFile && getExtension(requestedFile) === 'html') {
			readContent(requestedFile,
			function(err, content){
				if(content) {
					/* parseContent() is a wrapper for doT.template(); */
					parseContent(content, 
					function(something) {
						console.log('res.end');
						res.writeHead(200);
						res.end(something);
					}, 'first level');
				}
			});
		} else if (requestedFile) {
			/* Static content */
			checkFile(requestedFile, function(exists, path){
				if(exists) {
					readContent(path, function(err, data){
						if(err) {
							res.writeHead(500);
							res.end();
							throw err;
						}

						res.writeHead(200);
						res.end(data);
					});
				} else {
					/* File does not exist */
					res.writeHead(400);
					res.end();
				}
			});
		} else {
			res.writeHead(400);
			res.end();
		}
	}

	/**
	 * Parse Content is a wrapper for doT.template();
	 * It will dynamically build and populate the data parameter
	 * 
	 * If the content contans any partials it will 
	 * compiled it and return the result to the 
	 * callback
	 * If the content does not contain any partials 
	 * it will return the content to the callback
	 * 
	 * The function is recursive and async
	 * It will step through to the last level of
	 * nested partials and compile that level first
	 * the last level to be compiled is the "first level"
	 */
	function parseContent(content, callback, identifier){
		var
			partials = findPartials(content);
		console.log('parseContent', identifier);

		if(partials.length) {
			getPartials(partials,
			function(obj){
				var
					len = sizeOf(obj),
					i,
					t,
					parti;

				for(i in obj) {
					if(obj.hasOwnProperty(i)) {
						/* Have partials */
						parti = findPartials(obj[i]);

						/**
						 * Don't allow nesting of a partial inside of itself
						 * It would result in an infinite loop
						 */
						if(parti.indexOf(identifier) !== -1) {
							parti.splice(parti.indexOf(identifier),1);
						}

						if(parti.length) {
							parseContent(obj[i], function(c, id){
								len--;
								obj[id] = c;
								if(!len) {
									console.log('cb3', identifier);
									t = doT.template(content);
									callback(t(obj), identifier);
								}
							}, i);
						} else {
							len--;
							if(!len) {
								console.log('cb2', identifier);
								t = doT.template(content);
								callback(t(obj), identifier);
							}
						}
					}
				}
			});
		/* Does not have partials */
		} else {
			console.log('cb1', identifier);
			callback(content, identifier);
		}
	}

	function readContent(filename, callback, identifier) {
		fs.readFile(__dirname + filename, {'encoding': 'utf8'}, function(err, data){

			if(err) return callback(err);
			callback(err, data, identifier);
		});
	}

	/**
	 * Look for a file that matches the requested url and return it if it exists
	 *
	 * path: the path of the file 
	 * identifier: the identifier used by doT 
	 */
	function checkFile(path, identifier, callback) {
		// Allow the callback to be set as the
		// second parameter
		if((!callback || typeof callback !== 'function') && typeof identifier === 'function') {
			callback = identifier;
		}

		if(callback && typeof callback === 'function')
		fs.exists(__dirname + path, function(exists){
			callback(exists, path, identifier);
		});
	}

	/**
	 * Check if the requested page exists
	 * A page can be requested by its full path: /pages/{page}.html
	 * or shortened as /{page}
	 */
	function checkPage(path) {
		var 
			page = '/pages',
			parts = path.split('.');

		if(path === '/' || path === '/index.html') return '/index.html';

		page += parts[0] + '.html';
		if(!parts[1] && fs.existsSync(__dirname + page)) {
			return page;
		} else if (fs.existsSync(__dirname + path)) {
			return path;
		}
	}

	/**
	 * Find all the templating parts in use
	 */
	function findPartials(str){
		var
			rex = /\{\{=part.(.*)\}\}/g,
			matches = [],
			match;

		while((match = rex.exec(str)) !== null) {
			if(matches.indexOf(match[1]) === -1) {
				matches.push(match[1].split('.')[0]);
			}
		}

		return matches;
	}

	/**
	 * Load all the partials
	 */
	function getPartials(partials, callback) {
		var 
			i = 0,
			len = partials.length,
			filesRemaining = len, // Run callback when 0
			result = {}, // Param of callback
			path;

		if(!len) callback();

		for(; i < len; i++) {
			path = '/modules/' + partials[i] + '/html/' + partials[i] + '.html';

			checkFile(path, partials[i], function(fileExists, path, identifier) {
				if(fileExists) {
					readContent(path, function(err, data, identifier){

						result[identifier] = data;

						filesRemaining--;
						if(!filesRemaining) callback(result);
					}, identifier);
				} else {
					/**
					 * No file found
					 * 
					 * Render a hook not matched by a file to itself
					 * This will allow the use of doT templates in the browser
					 */
					filesRemaining--;

					result[identifier] = '{{=part.' + identifier + '}}';
					if(!filesRemaining) callback(result);
				}
			});
		}
	}

	/**
	 * Get the file extension
	 */
	function getExtension(filename) {
		var parts = filename.split('.');

		if(parts.length > 1) {
			return parts[parts.length - 1]; 
		} else return '';  
	}

	/**
	 * Get the length of an object
	 */
	function sizeOf(obj) {
		var 
			length = 0,
			i;

		for(i in obj) {
			if(obj.hasOwnProperty(i)) {
				length++;
			}
		}

		return length;
	}
})();
