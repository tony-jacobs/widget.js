
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
    },

    decodeUrlArguments: function decodeUrlArguments( argList )
    {
      argList = argList || window.location.search.substr( 1 ).split( '&' );
      var result = {};
      if( argList )
      {
        for( var i = 0; i < argList.length; ++i )
        {
          var kv = argList[ i ].split( '=', 2 );
          if( kv[0] )
            result[ kv[0] ] = (kv.length == 1) ? "" : decodeURIComponent( kv[1].replace( /\+/g, " " ) );
        }
      }
      return result;
    },

    alphanumericCompare: function alphanumericCompare( a, b ) {

      var aa = a.split(/(\d+)/);
      var bb = b.split(/(\d+)/);

      for( var x = 0; x < Math.max(aa.length, bb.length ); x++ )
      {
        if( aa[x] != bb[x] )
        {
          var cmp1 = (isNaN(parseInt(aa[x],10)))? aa[x] : parseInt(aa[x],10);
          var cmp2 = (isNaN(parseInt(bb[x],10)))? bb[x] : parseInt(bb[x],10);

          if( cmp1 === undefined || cmp2 === undefined )
            return aa.length - bb.length;
          else
            return (cmp1 < cmp2) ? -1 : 1;
        }
      }
      return 0;
    }
  };
})();
