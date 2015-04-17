widget.util = (function(){
  var db = {};
  var visitRecords = null;
  var config = {
    mode: 'ajax',
    endpoint: 'service/',
    keyPrefix: 'widget.js'
  };

  function getToken( flavor, str )
  {
    if( str )
    {
      var front = -1;
      var opens = 0;

      for( var i=0; i<str.length; i++ )
      {
        var ch = str.charAt(i);
        if( (ch === flavor ) && (str.charAt( i+1 ) == '{') )
        {
          if( front < 0 )
            front = i+2;
          opens += 1;
        }
        else if( ch == '}' )
        {
          opens -= 1;
          if( opens === 0 )
            return str.substring( front, i );
        }
      }
    }
    return null;
  }

  function decode( token )
  {
    token = expandTokens(token);
    var sep = token.indexOf( ',' );
    if( sep > -1 )
    {
      var dbName = token.substring( 0, sep );
      var path = token.substring( sep+1 ).split( '|', 2 );
      if( path.length > 1 )
        return widget.util.get( dbName, path[0], path[1] );
      else
        return widget.util.get( dbName, path[0] );
    }
    else
    {
      var stackVal = decode( "stack,0." + token );
      return stackVal || "${" + token + "}";
    }
  }

  function expandTokens( str )
  {
    var result = [];
    
    
    var token = getToken( '$', str );
    if( token )
    {
      var i = str.indexOf( token );
      if( i>2 )
        result.push( str.substring( 0, i-2 ) );

      result.push( decode(token) );

      if( str.length > (i + token.length + 1) )
      {
        result = result.concat( expandTokens( str.substring( i + token.length + 1 ) ) );
      }
    }
    else
    {
      token = getToken( '=', str );
      if( token )
      {
        /* jshint ignore:start */
        var f = new Function( "data", token );
        /* jshint ignore:end */
        var data = widget.util.get( 'stack', 0 );
        evaluatedToken = f( data );
        result.push( evaluatedToken );
      }
      else 
        result.push(str);
    }

    return result.join('');
  }

  var watchers = {};   
  var progressNow = 0;


  return {
    config: config,

    setConfig: function setConfig( options ) {
      config = $.extend( {}, config, options );
    },

    getData: function getData( key, defaultValue ) {
      if( !db[key] )
        db[key] = defaultValue || {};
      return db[key];
    },
    setData: function setData( key, data ) {
      db[key] = data;
      return data;
    },
    expandPath: expandTokens,
    decode: decode,

    get: function widgetUtilGet( key, path, defaultValue ) {
      return widget.get( widget.util.getData(key), widget.util.expandPath( path ), defaultValue );
    },

    set: function widgetUtilSet( key, path, newValue ) {
      widget.set( widget.util.getData(key), widget.util.expandPath( path ), newValue );
      widget.util.notifyWatchers( key, path, newValue );
    },

    loadData: function loadData( options, callback ) {

      var args = {
        page: options.name
      };
      
      options.layoutDataSource = options.layoutDataSource || ( options.layout ? 'options.layout' : config.mode );
      
      if( options.profile )
      {
        args.division = widget.get( options, 'profile.division' );
        args.area = widget.get( options, 'profile.region' );
      }

      if( widget.get( options, 'args.lastMod' ) )
      {
        args.lastMod = widget.get( options, 'args.lastMod' );
      }

      var persistenceKey = ( options.name == 'data' ) ? config.keyprefix+'.dataArgs' : null;


      var dataLoaderRegistry = {
        'options.layout': function optionsDataLoader( cacheArgs ) {
          if( $.isFunction( callback ) )
          {
            callback( options.layout );
          }
        },
        ajax: function ajaxDataLoader( cacheArgs ) {
    
          args = $.extend( args, (cacheArgs||{}) );
  
          var ajaxOpts = {
            url: config.endpoint,
            data: args,
            dataType: 'jsonp',
            success: function( response ) {
              if( persistenceKey && widget.util.useDataPersistence )
              {
                if( persistenceKey && response.args )
                  widget.getStorage().set( persistenceKey, response.args );
              }
              options.args = widget.get( response, 'args', options.args );
  
              if( $.isFunction( callback ) )
                callback( response );
            }
          };
  
          if( null === visitRecords )
          {
            widget.getStorage().get( config.keyprefix+'.visitRecords', function( value ){
              visitRecords = value || {};
              $.ajax( ajaxOpts );
            }, true );
          }
          else
            $.ajax( ajaxOpts );
        }
      };

      var dataLoader = dataLoaderRegistry[ options.layoutDataSource ];

      if( persistenceKey )
        widget.getStorage().get( persistenceKey, dataLoader );
      else
        dataLoader( null );
    },

    watch: function watch( key, path, observer )
    {
      var p = key+'.'+path;

      if( !watchers[p] )
      {
        watchers[p] = [];
      }
      watchers[p].push( observer );
    },

    notifyWatchers: function notifyWatchers( key, path, newValue )
    {
      var keys = (key+'.'+path).split('.');
      for( var i=keys.length; i>0; i-- )
      {
        var car = keys.slice( 0, i ).join('.');
        var cdr = keys.slice( i ).join('.');

        if( cdr )
        {
          if( i == 1 )
            newValue = widget.util.getData( key );
          else
            newValue = widget.util.get( key, keys.slice( 1, i ).join('.') );
        }

        if( $.isArray( watchers[car] ) )
        {
          for( var j in watchers[car] )
          {
            var observer = watchers[car][j];
            if( $.isFunction( observer ) )
              observer( newValue, cdr );
          }
        }
      }
    },

    getMessages: function getMessages( dataKey, filterUnread, changeListener, refreshTime )
    {
      var refilter = function refilterMessages() {
        var data = widget.util.getData( dataKey );
        var messages = {};
        $.each( ['alert','news'], function( i, key ) {
          if( data[key] )
          {
            $.each( data[key].content, function( j, msg ) {
              if( msg.unread || !filterUnread )
              {
                messages[ msg.id ] = msg;
              }
            });
          }
        });
        if( $.isFunction( changeListener ) )
          changeListener( messages );

        return messages;
      };

      if( refreshTime )
      {
        setInterval( refilter, refreshTime );
      }
      else
      {
        $.each( ['alert','news'], function( i, key ) {
          widget.util.watch( "data", key, function( key, newValue ) {
            refilter();
          });
        });
      }

      return refilter();
    },

    isRead: function isRead( key ) {
      var isUnread = visitRecords[key];
      return ( undefined === isUnread ) ? true : isUnread;
    },

    markAsRead: function markAsRead( data, key ) {
      key = key || data.key;
      event = data.type.toUpperCase() + "TITLEREAD";
      if( data.unread )
      {
        event = "NEW"+event;
        widget.util.set( "data", data.path+".unread", false );
        visitRecords[ key ] = false;
        widget.getStorage().set( config.keyprefix+'.visitRecords', visitRecords, true );
      }
      var obj = {};
      obj[ event ] = data.title;
      widget.util.track( obj );
    },

    resetUnread: function resetUnread() {
      console.log( "Resetting all message read indicators" );
      visitRecords = {};
      widget.getStorage().set( config.keyprefix+'.visitRecords', visitRecords, true );
      $.each( index.data, function(i,o){ o.unread = true; } );
    },
    
    setProgress: function setProgress( msg, pct, force ) {
      var seconds = Math.floor( (new Date().getTime()) / 1000 );
      if( seconds > progressNow )
      {
        progressNow = seconds;
        if( pct !== undefined )
        {
          msg += " (" + pct + "%)";
        }
    
        //$('.statusFeedbackPane').empty().text( msg );
        console.log( "STATUS " + msg );
      }
      else if( force )
        console.log( "STATUS " + msg );
    }
  };
})();

