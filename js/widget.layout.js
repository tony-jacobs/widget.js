widget.assets = (function(){
  map = {};

  return {
    map: map,
    get: function get( context, key, defaultValue ) {
      return widget.get( map, context+'.'+key, defaultValue );
    }
  };
})();

widget.layout = (function(){
  
  var assets = widget.assets;

  function createUrlAction( linkUrl, windowMode ) {
    return function() {
      window.open( linkUrl, (windowMode||'_blank') );
    };
  }

  function createCooperativeFrame( parent, url, label ) {
    return function showCooperativeFrame() {
      var animationTime = 250;

      var holder = $( '<div/>' ).addClass( 'cooperativeFrameHolder' );
      var iframe = $( '<iframe/>', {
        scrolling:true,
        marginheight:0,
        marginwidth:0,
        frameBorder: 0,
        width: '100%',
        height: '100%',
        src: url
      } ).addClass( 'cooperativeFrame' ).appendTo( holder );

      var labelHolder = $( '.panelLabel' ).filter( ':visible' );
      label = label || $( '<div/>', { text: 'X'} ).addClass( 'button' );

      labelHolder.addClass( 'clickable' ).on( 'click', function() {
        holder.remove();
        label.hide( 'slide', {direction:'up'}, animationTime, function() {
          label.remove();
          $('#appHeader').toggleClass( 'sublabelActive', false );
        });
        parent.slideDown( animationTime );
      });

      labelHolder.append( label.hide() );
      label.show( 'slide', {direction:'up'}, animationTime );
      $('#appHeader').toggleClass( 'sublabelActive', true );

      parent.slideUp( animationTime, function() {
        holder.appendTo( parent.parent() );
      } );

    };
  }

  function asArray( map )
  {
    var result = [];
    for( var key in map )
    {
      result.push( {
        key: key,
        value: map[key]
      });
    }
    return result;
  }

  function loadDataSource( dataSource, baseContent, options )
  {
    var db = widget.util.getData( dataSource.type, window[dataSource.type]||{} );
    
    var sourceData = widget.get( db, dataSource.path, {} );
    if( sourceData.content && $.isArray( sourceData.content ) )
      sourceData = sourceData.content;
      
    var sourceDataArray = $.isArray( sourceData ) ? sourceData : asArray( sourceData ) || [];
    var result = $.extend( {}, (baseContent||{}), sourceDataArray );

    if( options.sort )
    {
      result = applySort( options.sort, result );
    }

    return result;
  }
  
  function dispatch( parent, data, options, defaultHandler ) {
    
    function configureRenderer( data, options ) 
    {
      var typeKey = data.rendererKey || data.type;

      if( options && options.defaultRenderer )
      {
        data.rendererKey = 'renderer';
        data.dynamicRenderer = ( options.renderers && options.renderers[ typeKey ] ) ? options.renderers[ typeKey ] : options.defaultRenderer;
      }
      else
        data.rendererKey = typeKey;
    }
    
    options = $.extend( {}, options, data.options||{} );
    var factory = options.factory;
    delete options.factory;

    // Make a clone of data since we're monkeying with it's actual fields below..
    data = $.extend( {}, data );

    if( data.hasOwnProperty( 'dataSource' ) )
    {
      data.content = loadDataSource( data.dataSource, data.content, options );
    }
    
    configureRenderer( data, options.listOptions );

    if( factory && $.type( factory ) === 'string' )
      factory = widget.layout.registry[ factory ];

    var handler = factory || widget.layout.registry[data.rendererKey];
    if( $.isFunction( handler ) )
    {
      return handler( parent, data, options );
    }

    if( $.isFunction( defaultHandler ) )
      return defaultHandler( parent, data, options );
    else
      return parent;
  }

  function getTimestamp( article )
  {
    return article.post_date || article.lastModified;
  }

  var comparators = {
    'oldest' : function oldestComparator( a, b ) {
      return ( getTimestamp(a) - getTimestamp(b) );
    },
    'newest' : function newestComparator( a, b ) {
      return ( getTimestamp(b) - getTimestamp(a) );
    }
  };

  /**
   * Applies the given sort to the data.  If the data if an object, then the
   * keys will be lost in the conversion - the result is a simple
   * (non-associative) array
   **/
  function applySort( sortType, data )
  {
    if( data && $.isFunction( comparators[sortType] ) )
    {
      var a = [];
      for( var i in data ) {
        a.push( data[i] );
      }
      return a.sort( comparators[sortType] );
    }
    else
      return data;
  }

  var self = function layout( typeKey, parent, data, options ) {
    var layoutImpl = self.registry[ typeKey ] || self.registry.error;
  
    // Generate an options object by considering the layout's default values, 
    // any options on the data object, and the parameter options (last one wins)
    options = $.extend( {}, self.defaults[typeKey]||{}, data.options||{}, options||{} );

    return layoutImpl( parent, data, options );    
  };
  
  self.registry = {};
  self.defaults = {};
  self.documentation = {};
  self.register = function register( key, implementation, docs, defaults ) {
    self.registry[ key ] = implementation;
    self.defaults[ key ] = defaults||{};
    
    if( docs )
    {
      self.documentation[key] = ( $.type(docs)==='string' ) ? { description:docs } : docs;
    }
    
    return dispatch;
  };
  
  return self;
})();
