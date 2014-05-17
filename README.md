Estrad
======

This is a tool to make building modular HTML/CSS/JS websites and apps easier.

It allows you to keep all of a modules code together. To more easily find all the relevant code and to keep the code more structured.

## Install
To install Estrad´s dependencies, open a termial window and type:
	
	npm install

Estrad also uses [Gulp][0] which needs to be installed globally, to install it run the command:

	npm install gulp -g
	
## Build and start server
To build your project and to start a node server to view it you can simply type:

	gulp
	
Gulp will build any CSS and JS files and start a server at port `8080`, the port number can be changed in `index.js`. Gulp will then continuisly listen for file changes and new files to rebuild the scripts.

## Write a module
Estrad uses a slightly modified version of [doT][3] to build the html files. Use the `it` namespace to access properties set in the `json` file and `part` to include another module.

First you need a page, see `index.html` for an example. It looks like this:

	{{=part.header}}
	{{=part.example}}
	{{=part.footer}}

If you open it in the browser right now that's what it will look like too. `header`, `example` and `footer` are names of modules that the server will look for and interpolate in its place. The default name of the modules subdirectory is `modules/`.

The structure of a module looks like this:

	/example/template.html
	/example/example.json
	/example/alternative.json	
	/example/example.css
	/example/example.js
	
To use the `alternative.json` file include the module as `{{=part.example.alternative}}`.

Every CSS and JS file under `/modules/` and in the `/css/` respectively `/js/` direcoriess will be concatinated to a `main.js` and `main.css` file.
This behaviour can be changed in the `Gulpfile.js`.

The [JSHint][1] options can, and should, be changed using the `.jshintrc` file.

### Build command
To buld the files without starting a server or watcher you type:

	gulp build

This will build, in addition to `css` and `js`, your `html` templates and output it to the folder `./html`.

## Reverse proxy
Estrad has reverse proxy functionality. To set up a path add it to `routes.json`. This can be a local resourse or cross domain.

Any query parameters you add to the local request will be added to the proxy request. If you have added query parameters to the routed url in `routes.json` any local query parameters will replace them.

[0]: https://github.com/gulpjs/gulp
[1]: https://github.com/jshint/jshint/
[2]: http://olado.github.io/doT/index.html
