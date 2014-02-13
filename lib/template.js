(function(){
	"use strict";
	module.exports = new Template();

	function Template() {
		function solveDependencies(obj, dependees, dependencies, callback){
			var key, i, len, tobj, last, tmp;
			// Inefficiency galore

			while(Object.keys(dependees).length) {
				// Detect infinite dependency loops
				if(last) {
					tmp = JSON.stringify(dependees);
					if(tmp === last) {
						break;
					} else {
						last = tmp;
					}
				} else {
					last = JSON.stringify(dependees);
				}

				for(key in dependencies) {
					if(dependencies.hasOwnProperty(key) &&
					!dependencies[key].length && 
					dependees[key]) {
						i = 0;
						len = dependees[key].length;
						tobj = {};
						tobj[key] = obj[key];

						for(; i < len; i++) {

							// 
							obj[dependees[key][i]] = interpolate(obj[dependees[key][i]], tobj);

							// Remove solved dependencies
							dependencies[dependees[key][i]].splice(dependencies[dependees[key][i]].indexOf(dependees[key]),1);
						}

						// Remove solved dependees
						delete dependees[key];
					}
				}
			}

			callback(null, obj);
		}

		function interpolate(source, obj) {
			var 
				keys = Object.keys(obj),
				i = 0,
				len = keys.length,
				rex;

			for(; i < len; i++) {
				// This line is the reason why this app has
				// its own interpolate and don't use another
				// templating engine
				if(typeof obj[keys[i]] === 'undefined') continue;
				rex = '\\{\\{=part.' + keys[i] + '\\}\\}';
				source = source.replace(new RegExp(rex, 'g'), obj[keys[i]]);
			}

			return source;
		}

		return {
			'interpolate': interpolate,
			'solveDependencies': solveDependencies
		};
	}
})();