Estrad
======

Estrad is a collection of Gulp tasks, and a tool to make building modular HTML/CSS/JS websites easier. 

## Install

Estrad requires node.js, install it if you have not already.

Esdrad is installed as a npm module, though it's not currently published to npm. To install Estrad add it as a dependency to your `package.json` file.

```json
devDependencies: {
	"estrad": "git+https://github.com/Vinnovera/estrad.git#a8d47e92a7de958b44611f88c4778be886d0bd2a"
}
```

and install:

```bash
$ npm install
```

Estrad uses [Gulp][0] which needs to be installed globally:

```bash
$ npm install gulp -g
```

To use Estrad include it in your `Gulpfile.js` and pass it gulp.

```js
var
	gulp = require('gulp'),
	estrad = require('estrad')(gulp);

gulp.task('default', ['estrad']);
```

## Options

As Estrad includes a lot of task, every task is disabled as default. The available options are:

```json
{
	"build": {
		"html":    false,
		"compass": false
		},
	"watch": {
		"images":  false,
		"svg":     false,
		"js":      false,
		"css":     false,
		"server":  false
		},
	"process": {
		"server":  false,
		"compass": false
		},
	"task": {
		"js": {
			"jshint": false
			},
		"css": {
			"concat": false
			},
		"svg": {
			"svg2png": false
			},
		"images": {
			"minify": false
		} 
		},
	"server": {
		"proxy": false,
		"port":  8080,
		"template": {
			"folder": "modules",
			"templateSettings": {}
		}
		},
	"paths": {
		"server": {
			"listen": []
			},
		"style": {
			"src": [
				"./css/**/*.css", 
				"./modules/**/*.css", 
				"!css/main.css",
				"!/node_modules/**/*.js"
			],
			"listen": [
				"modules/**/*.css", 
				"css/**/*.css"
			],
			"dest": {
				"file": "main.css",
				"dir":  "./css/"
			}
			},
		"script": {
			"listen": [
				"js/**/*.js", 
				"modules/**/*.js", 
				"!/node_modules/**/*.js"
			],
			"dest": "main.js"
			},
		"svg2png": {
			"listen": [
				"img/**/*.svg"
			]
			},
		"image": {
			"listen": [
				"img/**/*.jpg", 
				"img/**/*.gif", 
				"img/**/*.png", 
				"img/**/*.svg"
			]
			},
		"build": {
			"src": [
				"./**/*.html",
				"!./modules/**/*.html", 
				"!./node_modules/**/*.html"
			],
			"dest": "./package"
		}
	}
}
```

## Watching files

Estrad is set up to continously bild your files as changes are made.

`html` files will not be built, rather an Express server will start on `localhost:8080` to serve `html`.

### JSHint
[JSHint][1] is included to lint `js` files. To change the ruleset add a `.jshintrc` file.

## Build files

To build the project files type:

```bash
$ gulp estrad-build
```

This will build any `css`, `js` and `html` files.

## Write a module

First you need a page, see `index.html` for an example. It looks like this:

	{=part.header}
	{=part.example}
	{=part.footer}

The example only includes the `example` module. To create the `header` and `footer`modules, add the files `/modules/header/header.html` and `/modules/footer/footer.html`.

The structure of a module looks like this:

	/example/example.html
	/example/example.json
	/example/alternative.json	
	/example/example.css
	/example/example.js

To use the `alternative.json` file include the module as `{=part.example.alternative}`.

Estrad uses [doT][2] to for including mock data. Use the `it` namespace to access properties set in the `json` files. Only data from that modules `json` file will be used, and is not shared accross modules.

## Reverse proxy
Estrad has reverse proxy functionality. To set up a path add it to `routes.json`. This can be a local resourse or cross domain.

The proxy will pass on any queries, but they can also be overridden in the `routes.json` file.

[0]: https://github.com/gulpjs/gulp
[1]: https://github.com/jshint/jshint/
[2]: http://olado.github.io/doT/index.html
