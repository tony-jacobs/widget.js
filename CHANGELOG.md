0.7.3 (unreleased)
--
* tabChange event on tabGroup widget, tabWillChange events on the tab manager
* URL argument template using format ?{key}


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
