Roadmap for widget.js
===

Easy
--
* New template type for formatters (perhaps #{value|type,args})
  - Include: percent, time, money, and phone numbers.
  - Should be pluggable.  For example, phone numbers is not general.


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
