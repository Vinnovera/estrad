(function(){
	var 
		through = require('async-through'),
		gutil = require('gulp-util'),
		autoload = require("./autoload"),
		template = require("./template"),
		PluginError = gutil.PluginError;

	const PLUGIN_NAME = 'gulp-partials';

	module.exports = Partials;

	function Partials() {
		console.log(arguments);

		return through(function(file){
			if (file.isNull()) return;
			var self = this;

			autoload.getPartials(file.contents.toString(), function(err, content, obj, dependencies, dependees){

				template.solveDependencies(obj, dependees, dependencies, function(err, obj){

					page = template.interpolate(content, obj);

					file.contents = new Buffer(page);

					self.emit('data', file);
				});
			});
			
		}, function(){
			this.emit('end');
		});
	}
})();