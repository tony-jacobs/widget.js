var Tracking = (function() {

  var defaults = false;

  var Tracking = function() {
    this.init();
  };

  Tracking.prototype = {
    init: function() {
    },

    setDefaultKeyValue: function setDefaultKeyValue( key, value ) {
      if( ! defaults )
        defaults = {};

      if( value === undefined || value === null )
        delete defaults[key];
      else
        defaults[key] = value;
    },

    track: function track( data ) {
      console.log( "Track", data );
      return data;
    }
  };

  return Tracking;
})();

widget.tracker = new Tracking();
widget.track = widget.tracker.track;

