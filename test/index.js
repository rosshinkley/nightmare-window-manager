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
    require('../nightmare-window-manager')(Nightmare);
    server.listen(7500, done);
  });

  it('should be constructable', function * () {
    var nightmare = Nightmare();
    nightmare.should.be.ok;
    yield nightmare.end();
  });

  describe('managing windows', function() {
    var nightmare;

    beforeEach(function() {
      nightmare = Nightmare({
        show: false
      });
    });

    afterEach(function * () {
      yield nightmare.end();
    });

    it('should get multiple windows', function * () {
      var windows = yield nightmare
        .windowManager()
        .goto(base)
        .click('#clicker')
        .waitWindowLoad()
        .windows();

      windows.length.should.equal(2);
      windows[0].title.should.equal('multiple window');
      windows[1].title.should.equal('second window');
    });

    it('should be able to get the focused window', function * () {
      var focused = yield nightmare
        .windowManager()
        .goto(base)
        .click('#clicker')
        .waitWindowLoad()
        //.focusWindow(2)
        .currentWindow()

      focused.title.should.equal('second window');
    });

    it('should be able to focus another window', function * () {
      var focused = yield nightmare
        .windowManager()
        .goto(base)
        .wait('body')
        .click('#clicker')
        .waitWindowLoad()
        .focusWindow(1)
        .currentWindow();

      focused.title.should.equal('multiple window');
    });

    it('should be able to close a window not in focus', function * () {
      var windows = yield nightmare
        .windowManager()
        .goto(base)
        .wait('body')
        .click('#clicker')
        .focusWindow(1)
        .click('#clicker')
        .waitWindowLoad()
        .closeWindow(2)
        .windows()

      windows.length.should.equal(2);
      windows[0].id.should.equal(1);
      windows[1].id.should.equal(3);
    });

    it('should be able to close a window in focus', function * () {
      var windows = yield nightmare
        .windowManager()
        .goto(base)
        .wait('body')
        .click('#clicker')
        .waitWindowLoad()
        .focusWindow(1)
        .click('#clicker')
        .waitWindowLoad()
        .focusWindow(2)
        .closeWindow(2)
        .windows()

      windows.length.should.equal(2);
      windows[0].id.should.equal(1);
      windows[1].id.should.equal(3);
      nightmare.focusedWindow.should.equal(1);
    });
  });

  describe('evaluating on a window', function() {
    var nightmare;

    beforeEach(function() {
      nightmare = Nightmare({
        show: false
      });
    });

    afterEach(function * () {
      yield nightmare.end();
    });

    it('should evaluate javascript on the page, with parameters', function * () {
      var title = yield nightmare
        .windowManager()
        .goto(base)
        .click('#clicker')
        .waitWindowLoad()
        .evaluateWindow(function(parameter) {
          return document.title + ' -- ' + parameter;
        }, 'testparameter');
      title.should.equal('second window -- testparameter');
    });
  });
});
