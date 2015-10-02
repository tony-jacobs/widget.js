
widget.util = (function(){
  var db = {};
  var config = {
    mode: 'ajax',
    endpoint: 'service/',
    keyPrefix: 'widget.js'
  };

  var watchers = {};   
  var progressNow = 0;

  return {
    config: config,

    setConfig: function setConfig( options ) {
      config = $.extend( {}, config, options );
    },

    getStack: function getStack() {
      return db.stack;
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
    expandPath: widget.parser.expandPath,
    decode: widget.parser.decode,

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
    },
    
    keyPaths: function keyPaths( obj, prefix )
    {
      if( prefix )
        prefix += ".";
      else
        prefix = "";

      var paths = [];
      for( var k in obj )
      {
        switch( $.type( obj[k] ) )
        {
          case 'array':
          case 'object':
            Array.prototype.push.apply( paths, keyPaths( obj[k], (prefix+k) ) );
            break;
            
          default:
            paths.push( prefix+k );
        }
      }
      return paths;
    }
  };
})();

