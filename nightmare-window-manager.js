var Nightmare = require('nightmare'),
  debug = require('debug')('nightmare:window-manager');

Nightmare.action('getAllWindows',
  function(name, options, parent, win, renderer, done) {
    done();
    return this;
  },
  function(done) {});

Nightmare.action('getFocusedWindow',
  function(name, options, parent, win, renderer, done) {
    done();
    return this;
  },
  function(done) {});

Nightmare.action('focusWindowById',
  function(name, options, parent, win, renderer, done) {
    done();
    return this;
  },
  function(done) {});
