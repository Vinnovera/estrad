Estrad
======

Estrad is a collection of Gulp tasks, and a tool to make building modular HTML/CSS/JS websites easier.

The goal is to have a build process fast enough that you do not have to wait whenever a file is saved. Because of the possible complexity of HTML templates Estrad will not compile them on file save. Instead a server is included that compiles HTML pages on request.

## Install

Estrad requires node.js, install it if you have not already.

Estrad is installed as a npm module. It's not currently published to npm, to install Estrad as a dev dependency run:

```bash
$ npm install git+https://github.com/Vinnovera/estrad.git#<latest commit SHA hash> --save-dev
```

[Gulp][0] needs to be installed globally:

```bash
$ npm install gulp -g
```

Include Estrad in your `Gulpfile.js` and pass it gulp:

```js
var
	gulp = require('gulp'),
	estrad = require('estrad')(gulp, options);

gulp.task('default', ['estrad']);
```

## Options

Estrad includes a lot of tasks, all are disabled by default. The default options are:

```json
{
	"dir": {
		"src": "/",
		"partials": "/",
		"build": "/"
	},
	
	"css": {
		"watch":        false,
		"build":        false,
		"preprocessor": false,
		"settings":     {},
		"minify":       false,
		"paths": {
			"listen": [
				
			],
			"src": [
				"!./node_modules/"
			],
			"dest": ""
		}
	},

	"html": {
		"build": false,
		"prettify": {
			"indent_size": 1,
			"indent_char": "\t",
			"preserve_newlines": false
		},
		"paths": {
			"src": [
				"!./node_modules"
			],
			"dest": ""
		}
	},

	"images": {
		"watch": false,
		"build": false,
		"svgToPng": false,
		"paths": {
			"listen": [

			],
			"dest": ""
		}
	},

	"js": {
		"watch": false,
		"build": false,
		"uglify": {},
		"paths": {
			"require": "",
			"listen": [
				
			],
			"src":  [
				"!./node_modules"
			],
			"dest": ""
		}
	},

	"server": {
		"start": false,
		"proxy": false,
		"port":  8080,
		"templateSettings": {}
	},

	"static": {
		"build": false,
		"paths": {
			"src": [
				"!./node_modules"
			],
			"dest": ""
		}
	}
}
```

### dir
#### src
Directory of source files. 

#### partials
Directory of html partials.

#### build
Directory to output the built project to.

### css

#### preprocessor

Can be:

`false` for no preprocessor.

`"sass"` to use SASS with Compass. Requires that you add `config.rb`.

`"stylus"` to use Stylus with Nib.

#### settings
Stylus settings object. Values here will be passed to [gulp-stylus][4]. 

Example:

```json
{
	"compress": true,
	"linenos": true,
	"url": "url"
}
```

The `url` option will base64 images and inline them in the css file.

### images

Smushes `svg`, `png`, `jpg` and `gif` files. Will also create a `png` from any `svg`.

### js

#### watch
At the moment all this does is lint your files with [JSHint][1]. Estrad comes with a basic setup of rules. To change the ruleset add a `.jshintrc` file. 

#### build
Require.js optimization tool [r.js][3].

### server

#### template

##### templateSettings
doT.templateSettings

Set these to avoid running your client templates on the server.

## Watching files

```bash
$ gulp estrad
```

## Build files

To build the project files type:

```bash
$ gulp estrad-build
```

This will build any `css`, `js` and `html` files.

The idea is that this process will compile a "deliverable" of all front end code. This is a goal for the future.

## Write a module

First you need a page, see `index.html` for an example. It looks like this:

	{=part.header}
	{=part.example}
	{=part.footer}

The structure of a module can look like this:

	/example/example.html
	/example/example.json
	/example/alternative.json	
	/example/example.css
	/example/example.js

To use the `alternative.json` file include the module as `{=part.example.alternative}`.

To create `header` and `footer` modules, add the files `/modules/header/header.html` and `/modules/footer/footer.html`.

### doT
Estrad uses [doT][2] to for including mock data. Use the `it` namespace to access properties set in the `json` files. The mock data is self-contained and will only affect that module.

## Reverse proxy
Estrad includes a reverse proxy. To set up a path add it to `routes.json`. This can be a local resourse or cross domain.

Get queries can be overridden in `routes.json`.

[0]: https://github.com/gulpjs/gulp
[1]: https://github.com/jshint/jshint/
[2]: http://olado.github.io/doT/index.html
[3]: http://requirejs.org/docs/optimization.html
[4]: https://github.com/stevelacy/gulp-stylus