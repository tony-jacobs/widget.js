
(function historyClosure(){

  var History = function() {
    this.enabled = false;
    this.defaultState = {};
  };

  History.prototype.processHistoryEvent = function processHistoryEvent( state )
  {
    state = $.extend( state || {}, this.defaultState, widget.util.decodeUrlArguments() );
    widget.eventBus.trigger( 'history', state );
  };

  History.prototype.pushHistory = function pushHistory( key, value, state, name )
  {
    if( this.enabled )
    {
      var argMap = widget.util.decodeUrlArguments();
      argMap[ key ] = value;
      history.pushState( state, name, '?'+$.param(argMap) );
    }
  };

  widget.history = new History();

  widget.eventBus.on( 'ready', function( context, event ){
    if( event.history )
    {
      widget.history.enabled = event.history.enabled;
      widget.history.defaultState = event.history.defaultState || {};

      if( widget.history.enabled )
        widget.history.processHistoryEvent();
    }
  });

  window.addEventListener( 'popstate', function( event ) {
    widget.history.processHistoryEvent( event.state );
  });

})();
