(function(){
	var 
		through = require('async-through'),
		gutil = require('gulp-util'),
		partials = require("estrad-template"),
		PluginError = gutil.PluginError;

	const PLUGIN_NAME = 'gulp-partials';

	module.exports = Partials;

	function Partials() {
		return through(function(file){
			if (file.isNull()) return;
			var self = this;

			partials(file.contents, function(err, content){
				file.contents = new Buffer(content);

				self.emit('data', file);
			});
			
		}, function(){
			this.emit('end');
		});
	}
})();