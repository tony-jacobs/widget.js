Roadmap for widget.js
===

Easy
--
* New template type for formatters (perhaps #{value|type,args})
  - Include: time, money, and phone numbers.
  - Should be pluggable.  For example, phone numbers is not general.


* Remove legacy tab event handlers in favor of recently added tabManager eventBus and widget event arguments

* Remove size formatting code (or make it part of the template)

* Remove 'content' layout widget (it's not special)


Medium
--
* Remove dependencies from widget-util (jquery, knockout, etc)

* Make form validation mature  (try more cases, add more validators)

* Clean up the animation processing.  The tab group stuff is fine, but doesn't generalize to other element types

* Re-organize tracking subsystem to rely on event model.  Implementation on recent projects didn't actually use widget.tracking.

* Documentation revisit


Complex
--
* Style processing

* Visible / hidden events, particularly for tabs

* Allow deferred widget renderers (promise from dataReady, placeholder layout while waiting for dataReady to resolve)
