
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

  function formatSize( bytes, decimalFix, si )
  {
    var thresh;
    var units;
    if( si === undefined )
    {
      thresh = 1024;
      units = ['k','M','G','T','P','E','Z','Y'];
    }
    else
    {
      thresh = (si ? 1000 : 1024);
      units = si ? ['kB','MB','GB','TB','PB','EB','ZB','YB'] : ['KiB','MiB','GiB','TiB','PiB','EiB','ZiB','YiB'];
    }

    if(bytes < thresh) return bytes + ' B';
    var u = -1;
    do {
      bytes /= thresh;
      ++u;
    } while(bytes >= thresh);
    return bytes.toFixed( decimalFix||1 )+' '+units[u];
  }

  function printCompressionStats( startTime, message, s1, s2 )
  {
    var ms = (Date.now()-startTime);
    if( ms > 10 )
    {
      var pct = ( 100 * s1/s2 ).toFixed( 2 );
      console.log( message + " " + formatSize( s1*2, 2 ) + " --> " + formatSize( s2*2, 2 ) + " (" + pct + "%) in " + ms + " ms" );
    }
  }

  var self = {
    get: get,
    set: set,

    getStorage: function getStorage( preferLocal )
    {
      var flavor = preferLocal ? 'local' : 'sync';
      var chromeStorage =  (window.chrome && chrome.storage && chrome.storage[flavor]);
      var decodeStorage = function decodeStorage( encoded, isCompressed, dataName ) {
        var obj = null;
        if( encoded )
        {
          if( isCompressed )
          {
            var now = Date.now();
            var oldLen = encoded.length;
            encoded = LZString.decompressFromUTF16( encoded );
            var ms = (Date.now()-now);
            if( ms > 10 )
            {
              var pct = Math.floor(10000*encoded.length/oldLen)/100;
              printCompressionStats( now, dataName + " Decompress", oldLen, encoded.length );
            }
          }
          obj = JSON.parse( encoded );
        }
        return obj;
      };
      var encodeStorage = function encodeStorage( obj, willCompress, dataName ) {
        var encoded = "";
        if( obj )
        {
          encoded = JSON.stringify( obj );
          if( willCompress )
          {
            var now = Date.now();
            var oldLen = encoded.length;
            encoded = LZString.compressToUTF16( encoded );
            printCompressionStats( now, dataName + " Compress", oldLen, encoded.length );
          }
        }
        return encoded;
      };

      if( chromeStorage )
        return {
          get: function( key, callback, useCompression ) {
            chrome.storage[flavor].get( key, function( obj ) {
              callback( decodeStorage( obj[ key ], useCompression, key ) );
            } );
          },
          set: function( key, value, useCompression ) {
            chrome.storage[flavor].set( { key: encodeStorage( value, useCompression, key ) } );
          }
        };
      else
        return {
          get: function( key, callback, useCompression ) {
            // Yield the thread to prevent synchronous processing
            setTimeout( function() {
              var data = window.localStorage[ key ];
              callback( decodeStorage( data, useCompression, key ) );
            }, 0 );
          },
          set: function( key, value, useCompression ) {
            window.localStorage.setItem( key, encodeStorage( value, useCompression, key ) );
          }
        };
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
