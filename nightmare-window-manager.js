var debug = require('debug')('nightmare:window-manager');

module.exports = function(Nightmare) {
  Nightmare.action('windowManager', function(name, options, parent, win, renderer, done) {
    parent.on('windowManager', function() {
      var app = require('electron')
        .app;
      app.on('browser-window-created', function(event, win) {
        win.webContents.on('did-finish-load', function(event) {
          parent.emit('changeFocusWindow', win.id);
        });
      });
      parent.emit('windowManager');
    });
    done();
  }, function(done) {
    var self = this;
    this.focusedWindow = 1;
    this.child.on('changeFocusWindow', function(windowId) {
      self.focusedWindow = windowId;
    });
    this.child.once('windowManager', done);
    this.child.emit('windowManager');
  });

  Nightmare.action('windows',
    function(name, options, parent, win, renderer, done) {
      parent.on('windows', function(focusedWindowId) {
        var BrowserWindow = require('electron')
          .BrowserWindow;
        var windows = BrowserWindow.getAllWindows()
          .map(function(win) {
            return {
              id: win.id,
              isDestroyed: win.isDestroyed(),
              isFocused: win.id == focusedWindowId,
              isVisible: win.isVisible(),
              bounds: win.getBounds(),
              size: win.getSize(),
              contentSize: win.getContentSize(),
              isClosable: win.isClosable(),
              title: win.getTitle(),
              url: win.getURL(),
            };
          });

        parent.emit('windows', windows);
      });
      done();
      return this;
    },
    function(done) {
      debug('windows');
      this.child.once('windows', function(windows) {
        done(null, windows);
      });
      this.child.emit('windows', this.focusedWindow);
    });

  Nightmare.action('waitWindowLoad',
    function(name, options, parent, win, renderer, done) {
      var BrowserWindow = require('electron')
        .BrowserWindow;
      parent.on('waitWindowLoad', function() {
        var wait = function() {
          setTimeout(function() {
            var isLoading = BrowserWindow.getAllWindows()
              .map(function(win) {
                return win.webContents.isLoading();
              })
              .reduce(function(accumulator, value) {
                return accumulator || value;
              }, false);
            if (isLoading) {
              wait();
            } else {
              parent.emit('waitWindowLoad');
            }

          }, 250);
        };
        wait();
      })
      done();
    },
    function(done) {
      debug('waitWindowLoad');
      this.child.once('waitWindowLoad', done);
      this.child.emit('waitWindowLoad');
    });

  Nightmare.action('currentWindow',
    function(name, options, parent, win, renderer, done) {
      var BrowserWindow = require('electron')
        .BrowserWindow;
      parent.on('currentWindow', function(focusedWindowId) {
        var win = BrowserWindow.fromId(focusedWindowId);
        current = {
          id: win.id,
          isDestroyed: win.isDestroyed(),
          isFocused: win.isFocused(),
          isVisible: win.isVisible(),
          bounds: win.getBounds(),
          size: win.getSize(),
          contentSize: win.getContentSize(),
          isClosable: win.isClosable(),
          title: win.getTitle(),
          url: win.getURL(),
        };
        parent.emit('currentWindow', current);
      });
      done();
      return this;
    },
    function(done) {
      this.child.once('currentWindow', function(window) {
        done(null, window);
      });
      this.child.emit('currentWindow', this.focusedWindow);
    });

  Nightmare.action('closeWindow',
    function(name, options, parent, win, renderer, done) {
      var BrowserWindow = require('electron')
        .BrowserWindow;
      parent.on('closeWindow', function(windowId, focusedWindow) {

        var win = BrowserWindow.fromId(windowId);
        win.close();

        if (windowId == focusedWindow) {
          var unclosedWindows = BrowserWindow.getAllWindows()
            .filter(function(win) {
              return !win.isDestroyed();
            });
          if (unclosedWindows.length == 0) {
            throw new Error('no windows to fall back to!');
          } else {
            parent.emit('changeFocusWindow', unclosedWindows[0].id);
          }
        }

        parent.emit('closeWindow');
      });
      done();
      return this;
    },
    function(windowId, done) {
      this.child.once('closeWindow', done);
      this.child.emit('closeWindow', windowId, this.focusedWindow);
    });

  Nightmare.action('focusWindow',
    function(name, options, parent, win, renderer, done) {
      parent.on('focusWindow', function(windowId) {
        parent.emit('changeFocusWindow', windowId);
        parent.emit('focusWindow');
      });
      done();
      return this;
    },
    function(windowId, done) {
      this.child.once('focusWindow', done);
      this.child.emit('focusWindow', windowId);
    });

  Nightmare.action('evaluateWindow',
    function(name, options, parent, win, renderer, done) {
      var BrowserWindow = require('electron')
        .BrowserWindow;
      parent.on('evaluateWindow', function(focusedWindowId, src) {
        renderer.once('window-response', function(event, response) {
          parent.emit('evaluateWindow', null, response);
        });

        renderer.once('window-error', function(event, error) {
          parent.emit('evaluateWindow', error);
        });

        BrowserWindow.fromId(focusedWindowId)
          .webContents.executeJavaScript(src);
      });

      done();
      return this;
    },
    function(fn) {
      var args = require('sliced')(arguments);
      var done = args[args.length - 1];
      var fntext = String(fn);
      var stringArgsList = JSON.stringify(args.slice(1, -1))
        .slice(1, -1);

      this.child.once('evaluateWindow', function(err, result) {
        if (err) return done(err);
        done(null, result);
      });

      var template = `
        (function javascriptWindow(){
          try{
            var response = (${fntext})(${stringArgsList});
            __nightmare.ipc.send('window-response', response);
          }
          catch(e){
            __nightmare.ipc.send('error', e.message);
          }
        })();
      `;

      this.child.emit('evaluateWindow', this.focusedWindow, template);
    });
};
