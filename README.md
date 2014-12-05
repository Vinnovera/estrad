Estrad
======

This is a tool to make building modular HTML/CSS/JS websites easier.

## Install

Estrad requires node.js, install it if you have not already.

To get Estrad, open a terminal window type:

```bash
$ git clone https://github.com/Vinnovera/estrad
```

Install dependencies:

```bash
$ cd estrad
$ npm install
```

Estrad uses [Gulp][0] which needs to be installed globally:

```bash
$ npm install gulp -g
```

## Watching files

Start the file watcher with:

```bash
$ gulp
```

Gulp is set up to continously bild your files as changes are made.

`html` files will not be built, rather an Express server will start on `localhost:8080` to serve `html`.

[JSHint][1] is included to lint `js` files. JSHint options can be changed in the `.jshintrc` file.

## Build files

To build the project files type:

```bash
$ gulp build
```

This will build any `css`, `js` and `html` files.

## Write a module

First you need a page, see `index.html` for an example. It looks like this:

	{=part.header}
	{=part.example}
	{=part.footer}

Only the `example` module is set. To add a common header and footer add the files `/modules/header/header.html` and `/modules/footer/footer.html`.

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
