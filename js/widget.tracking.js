var Tracking = (function() {

  var defaults = false;
  var self;

  var Tracking = function() {
    self = this;
    
    this.init();
    this.events = [];
  };

  Tracking.prototype = {
    init: function() {
      tracker = this;
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
      //console.log( "Track", data );
      self.events.push( data );
      return data;
    }
  };

  return Tracking;
})();

widget.tracker = new Tracking();
widget.track = widget.tracker.track;

