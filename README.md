Estrad
======

This is a tool to make building modular HTML/CSS/JS websites and apps easier.

It allows you to keep all of a modules code together. To more easily find all the relevant code and to keep the code more structured.

## Install
To install Estrad´s dependencies, open a termial window and type:
	
	npm install

Estrad also uses [Gulp][0], to install it run the command:

	npm install gulp -g
	
## Build and start server
To build your project and to start a node server to view it you can simply type:

	gulp
	
Gulp will build any CSS and JS files and start a server at port `8080`. Gulp will then continuisly listen for file changes and new files to rebuild the scripts.

## Write a module
First you need a page, see `index.html` as an example. It looks like this:

	{{=part.header}}
	{{=part.example}}
	{{=part.footer}}

If you open it in the browser right now that's what it will look like too. `header`, `example` and `footer` are names of modules that the server will look for and interpolate in its place. All modules needs to be placed under a `/modules/` subdirecotry.

The structure of a module looks like this:

	/example/html/example.html
	/example/html/alternative.html
	/example/example.css
	/example/example.js
	
To use the `alternative.html` markup include the module as `{{=part.example.alternative}}`.

Every CSS and JS file under `/modules/` and in the `/css/` respectively `/js/` direcoriess will be concatinated to a `main.js` and `main.css` file.
This behaviour can be changed in the `Gulpfile.js`.

The [JSHint][1] options can, and should, be changed using the `.jshintrc` file.

### Build command
To buld the files without starting a server or watcher you type:

	gulp buld

This will build, in addition to `css` and `js`, your `html` templates and output it to the folder `./html`.

## Reverse proxy
Estrad has reverse proxy functionality. To set up a path add it to `routes.json`. This can be a local resourse or cross domain.

Any query parameters you add to the local request will be added to the proxy request. If you have added query parameters to the routed url in `routes.json` any local query parameters will replace them.

[0]: https://github.com/gulpjs/gulp
[1]: https://github.com/jshint/jshint/
