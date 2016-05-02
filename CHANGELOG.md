0.8.1 (unreleased)
--
* Add potential argument to 'trigger' event call-through (events now passed context, event, arg where arg is the second parameter to $.trigger)


0.8.0 (2016.04.06)
--
* EXPERIMENTAL - styles
* Remove legacy tab UI events
* Remove 'content' layout widget, since it's not better than a label
* Add favicon using widget.ui.setFavicon()
* Keep list footers out of the DOM if not in use
* Removed unused functions and cleaned up globals
* Removed HTML5 storage abstraction (just use it directly)
* Removed Formatter subsystem - was not general or pluggable (see roadmap)


0.7.3 (2016.03.19)
--
* tabChange event on tabGroup widget, tabWillChange events on the tab manager
* URL argument template using format ?{key}
* Deprecated global validateEmail() in favor of widget.validate.email()
* Move (global) jquery plugins (sortlist, destroyed event) from widget-util to widget-core
* EXPERIMENTAL - form  and input field validation


0.7.2 (2016.03.10)
--
* Internationalization now supports both language and locale (using the format 'en-us')
* EXPERIMENTAL - tabs now support animation (use options animationHideNext, animationHidePrev, animationShowNext, animationShowPrev to specify the CSS animation class)


0.7.1 (2016.03.07)
--
* Tab event and data routing
* Table style bug fixes


0.7.0 (2016.02.28)
--
* Generate sub packages:
  - *util* - Just the utility methods like the path-aware 'get'
  - *core* - The widget layout library
  - *all* - Utilities, layout, and charting
* Remove incomplete and deprecated implementations
  - data loader
  - cooperative iframes
  - createScreen
  - search (remove dependency on lunr.js)
* Browser history support
* 'ready' event


0.6.1 (2016.02.25)
--
* Tab Manager
* Improve data sources for table and list widgets
* String event handlers


0.6.0 (2016.01.13)
--
* Localizations other than 'en'
* New approach to injecting widget.js into environment
* Global layout any options.tooltip


0.5.x (2015.10.14)
--
* Charting
* First public release (MIT License)
