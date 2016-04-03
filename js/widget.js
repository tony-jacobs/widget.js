
(function widgetJSClosure(){

  function get( obj, path, defaultValue )
  {
    $.each( path.split('.'), function(i,key) {
      return obj ? ( obj = obj[ key ] ) : false;
    });

    return (obj===undefined || obj ===null) ? defaultValue : obj;
  }

  function set( obj, path, newValue )
  {
    var keys = path.split('.');
    $.each( keys, function(i,key) {
      if( i == (keys.length-1) )
      {
        oldValue = obj[ key ];
        obj[key] = newValue;
        return false;
      }
      else
      {
        if( obj[key] === undefined || obj[key] === null )
        {
          obj[key] = {};
        }
        obj = obj[key];
      }
    });

    return oldValue;
  }

  function attachEvents( item, eventMap, context )
  {
    if( item && eventMap )
      $.each( eventMap, function( event, handler ) {
        $(item).on( event, null, context, handler );
      } );
  }

  var self = {
    eventBus: $('<div/>'),
    get: get,
    set: set,

    fire: function( key, event ) {
      self.eventBus.trigger( key+'.start', event||{} );
      self.eventBus.trigger( key, event||{} );
      self.eventBus.trigger( key+'.complete', event||{} );
    },

    getAncestorData: function getAncestorData( cxt, key, defaultValue )
    {
      if( !cxt )
        return defaultValue;

      var data = $(cxt).data();

      if( data && data[key] )
        return data[key];
      else
        return self.getAncestorData( $(cxt).parent(), key, defaultValue );
    },

    getStorage: function getStorage( preferLocal )
    {
      var flavor = preferLocal ? 'local' : 'sync';

      var decodeStorage = function decodeStorage( encoded, dataName ) {
        var obj = null;
        if( encoded )
        {
          obj = JSON.parse( encoded );
         }
        return obj;
      };
      var encodeStorage = function encodeStorage( obj, dataName ) {
        var encoded = "";
        if( obj )
        {
          encoded = JSON.stringify( obj );
        }
        return encoded;
      };

      return {
        get: function( key, callback ) {
          // Yield the thread to prevent synchronous processing
          setTimeout( function() {
            var data = window.localStorage[ key ];
            callback( decodeStorage( data, key ) );
           }, 0 );
        },
        set: function( key, value ) {
          window.localStorage.setItem( key, encodeStorage( value, key ) );
        }
      };
    },

    makeAutorefresh: function makeAutorefresh( view, update, refreshInterval, initialize  )
    {
      var refreshTimeout = null;
      refreshInterval = refreshInterval || 2000;

      if( $.isFunction( update ) )
      {
        var updater = function() {
          var shouldCancel = update( view );
          if( !shouldCancel && refreshTimeout )
            refreshTimeout = setTimeout( updater, refreshInterval );
        };
        refreshTimeout = setTimeout( updater, refreshInterval );
      }

      view.on( 'destroyed', function() {
        if( refreshTimeout )
        {
          clearTimeout( refreshTimeout );
          refreshTimeout = null;
        }
      });

      if( initialize && $.isFunction( update ) )
        update( view );

      return view;
    },

    symbol: function symbol( fontAwesomeKey, additionalClasses ) {
      var v = $( '<i/>' ).addClass( 'fa fa-' + fontAwesomeKey );
      if( additionalClasses )
        v.addClass( additionalClasses );

      return v;
    },

    symbolButton: function symbolButton( fontAwesomeKey ) {
      var v = $('<span/>').addClass( 'fa-stack fa-lg' );
      v.append( widget.symbol( 'square-o', 'fa-stack-2x' ) );
      v.append( widget.symbol( fontAwesomeKey, 'fa-stack-1x' ) );
      return v;
    }
  };

  window.widget = window.widget||{};
  for( var key in self )
    window.widget[key] = self[key];

})();
