Estrad
======

This is a tool to make building modular HTML/CSS/JS websites and apps easier.

It allows you to keep all of a modules code together. To more easily find all the relevant code and to keep the code more structured.

## Install
To install this Estrad´s dependencies open a termial window and type:
	
	npm install
	
## Build and start server
To build your project and to start a node server to view it you can simply type:

	gulp
	
[Gulp][0] will build any CSS and JS files and start a server at port `8080`. Gulp will then continuisly listen for file changes and new files to rebuild the scripts.

## Write a module
First you need a page, see `index.html` as an example. It looks like this:

	{{=part.header}}
	{{=part.body}}
	{{=part.footer}}

If you open it in the browser right now that's what it will look like too. `header`, `body` and `footer` are names of modules that the 
server will look for and interpolate in its place. All modules needs to be placed under a `/modules/` subdirecotry.
The structure of a module looks like this:

	/header/html/header.html
	/header/html/alternative.html
	/header/header.css
	/header/header.js
	
To load the `alternative.html` markup include the module as `{{=part.header.alternative}}`.

Every CSS and JS file under `/modules/` and in the `/css/` respectively `/js/` direcorys will be concatinated to a `main.js` and `main.css` file.
This behaviour can be changed in the `Gulpfile.js`.

The [JSHint][1] settings can and should be changed in the `.jshintrc` file.

[0]: https://github.com/gulpjs/gulp
[1]: https://github.com/jshint/jshint/