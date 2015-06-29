# widget.js 

Layout and Utilities for web apps


## Developer notes

This project uses NPM and grunt to get things done.  Start by running these commands:

    npm install
    npm install grunt-cli
    grunt


## Deployment guide

Update the version number in `package.json`.  Then, do:

    grunt dist


## Architecture

Widget is built by integrating individual library implementations into a core 
library with a suite of standard extenstions for widget layout, charting, and 
path/template expansion processing.

### Core features:

* **Layout** -- Custom and extensible layout language to create complex forms, 
lists, controls, and charts.  When possible, the widget layouts are 
sensitive to changes in underlying data models.

* **Template Expansion** -- Process object and path expansions to make it easy to 
data mine arbitrary objects.  The template language is extensible allowing 
downstream applications to create complex behaviors.

* **Search** -- Widget provides wrappers for the lunr.js in-client search engine.

* **Tracking** -- Widget provides wrappers for analytics and tracking.  This 
feature is abstractly implemented, so clients can call the tracking logic using 
the general widget.track() without detailed knowledge of the backing tracking 
service.

* **Utility functions** -- There are many utility functions to handle various 
UI tasks, mostly in support of the other major features listed here.


### Documentation

The (documentation.html) file included in the distribution uses the widget layout 
engine to introspectively generate documentation about widget.

