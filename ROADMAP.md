Roadmap for widget.js
===

Easy
--
* Remove size (bytes,GB,MB) formatting code (or make it part of the template)

* New template type for formatters (perhaps #{value|type,args})
  - Include: time, money, and phone numbers.
  - Should be pluggable.  For example, phone numbers is not general.

* Globals to be hidden in a closure:  Tracking, showIframePopup, showContentPopup

* Remove 'addAnchorSupport' -- too complex and too buggy


Medium
--
* Remove dependencies from widget-util (jquery, knockout, etc)

* Make form validation mature  (try more cases, add more validators)

* Clean up the animation processing.  The tab group stuff is fine, but doesn't generalize to other element types

* Re-organize tracking subsystem to rely on event model.  Implementation on recent projects didn't actually use widget.tracking.

* Documentation revisit


Complex
--
* Visible / hidden events, particularly for tabs

* Allow deferred widget renderers (promise from dataReady, placeholder layout while waiting for dataReady to resolve)
