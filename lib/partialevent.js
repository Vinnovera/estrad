(function(){
	"use strict";

	var
		fsh = require('./filehelper'),
		events = require('events');

	/* Extend EventEmitter */
	PartialEvent.super_ = events.EventEmitter;
	PartialEvent.prototype = Object.create(events.EventEmitter.prototype, {
		constructor: {
			value: PartialEvent,
			enumerable: false
		}
	});

	module.exports = new PartialEvent();

	function PartialEvent(){
		var
			self = this;

		events.EventEmitter.call(self);

		function loadPartial(name, callback){
			var
				parts = name.split('.'),
				module = parts[0],
				version = parts[1] || module,
				path = "/modules/" + module + '/' + version + ".html";

			fsh.fileContents(path, function(err, content){
				if(err) return callback(err);

				callback(err, content);
			});
		}

		self.loadPartial = function(name) {
			loadPartial(name, function(err, content){
				self.emit('partialLoaded', err, name, content);
			});
		};
	}
})();