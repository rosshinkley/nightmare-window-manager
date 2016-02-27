/**
 * Module dependencies.
 */

require('mocha-generators')
  .install();

var Nightmare = require('nightmare');
var should = require('chai')
  .should();
var url = require('url');
var server = require('./server');
var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');
var rimraf = require('rimraf');

/**
 * Temporary directory
 */

var tmp_dir = path.join(__dirname, 'tmp')

/**
 * Get rid of a warning.
 */

process.setMaxListeners(0);

/**
 * Locals.
 */

var base = 'http://localhost:7500/';

describe('Nightmare Window Manager', function() {
  before(function(done) {
    require('../nightmare-load-filter');
    server.listen(7501, function() {
      server.listen(7500, done);
    });
  });

  it('should be constructable', function * () {
    var nightmare = Nightmare();
    nightmare.should.be.ok;
    yield nightmare.end();
  });

  describe('managing windows', function() {
    var nightmare;

    beforeEach(function() {
      nightmare = Nightmare();
    });

    afterEach(function * () {
      yield nightmare.end();
    });

  });
});
