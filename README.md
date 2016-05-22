nightmare-window-manager
======================
Add window management to your [Nightmare](http://github.com/segmentio/nightmare) scripts.

## Usage
Simply require the library:

```js
var Nightmare = require('nightmare')
require('nightmare-window-manager')(Nightmare)
```
... and then enable the window manager with `.windowManager()`.  It should be the first call in your Nightmare chain.

### .windowManager()
Sets up window management.

### .windows()
Gets a listing of the windows currently open under the Nightmare instance.

### .waitWindowLoad()
Waits for all of the windows to no longer be in a loading state.

### .currentWindow()
Gets the current window.

### .closeWindow(windowId)
Closes the window specified by the window ID.  If the current window is the one being closed, the first non-closed window is set as focused.  __WARNING__: do not close the ID 1 as that will dispose the Nightmare plumbing.

### focusWindow(windowId)
Sets the given window ID as focused.

### evaluateWindow(fn[, arg1, arg2, ...])
Invokes `fn` on the currently selected window with the arguments supplied.  All of the arguments are optional.  On completion, it returns the return value of `fn`, same as Nightmare's `.evaluate()`.

## Example
```js
var Nightmare = require('nightmare');
require('nightmare-window-manager')(Nightmare);
var nightmare = Nightmare();
nightmare
    .windowManager()
    .goto(url)
    .click('#something_opens_a_window')
    .waitWindowLoad()
    .currentWindow()
    .then(function(window){
          //window contains useful information about the newly-opened window,
          //including the window ID
          console.dir(window)
    });
```
