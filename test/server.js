
/**
 * Module dependencies.
 */

var express = require('express');
var path = require('path');
var serve = require('serve-static');

/**
 * Locals.
 */

var app = module.exports = express();

app.use(serve(path.resolve(__dirname, 'fixture')));


/**
 * Start if not required.
 */

if (!module.parent) app.listen(7500);
