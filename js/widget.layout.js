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
  var visionUID = 10000;

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

  function asArray( obj )
  {
    switch( $.type( obj ) )
    {
      case 'array': 
        return obj;
        
      case 'function': 
        return $.isArray( obj() ) ? obj :  asArray( obj() );
        
      case 'object':
        var result = [];
        for( var key in obj )
        {
          result.push( {
            key: key,
            value: map[key]
          });
        }
        return result;
      
      default:
        return [ obj ];
    }
  }

  function loadDataSource( dataSource, baseContent, options )
  {
    var db = widget.util.getData( dataSource.type, window[dataSource.type]||{} );
    
    var sourceData = widget.get( db, dataSource.path, {} );
    if( sourceData.content && $.isArray( sourceData.content ) )
      sourceData = sourceData.content;
      
    var data = asArray( sourceData||[] );

    if( options.sort )
    {
      data = applySort( options.sort, $.isFunction(data) ? data() : data );
    }

    return data;
  }

  function dispatch( parent, layout, options, defaultHandler, stack ) 
  {
    var w = {
      parent: parent,
      data: layout,
      layout: $.extend( {}, layout ),
      options: options || {},
      stack: []
    };
    
    // Make a shallow copy of the data stack, as it gets pushed and popped a 
    // lot, and our downstream code may take a snapshot of things.
    stack = stack || widget.util.getStack();
    if( stack && stack.length )
    {
      for( var i=0; i<stack.length; i++ )
        w.stack.push( stack[i] ); 
    }
    else
      w.stack.push( layout );
    
    w.data = w.stack[0];
    
    function configureRenderer( w, options ) 
    {
      var typeKey = w.layout.rendererKey || w.layout.type;

      if( options && options.defaultRenderer )
      {
        w.layout.rendererKey = 'renderer';
        w.layout.dynamicRenderer = ( options.renderers && options.renderers[ typeKey ] ) ? options.renderers[ typeKey ] : options.defaultRenderer;
      }
      else
        w.layout.rendererKey = typeKey;
    }

    // Generate an options object by considering the layout's default values, 
    // any options on the data object, and the parameter options (last one wins)
    w.options = $.extend( {}, self.defaults[w.layout.rendererKey]||{}, w.options||{}, w.layout.options||{} );
    var factory = w.options.factory;
    delete w.options.factory;

    lifecycle( 'load', w );

    if( w.layout.hasOwnProperty( 'dataSource' ) )
    {
      w.layout.content = loadDataSource( w.layout.dataSource, w.layout.content, w.options );
    }
    
    if( w.data )
      w.data._vuid = w.data._vuid||('vuid-'+(visionUID++));
    
    lifecycle( 'dataReady', w );
    configureRenderer( w, w.options.listOptions );

    if( factory && $.type( factory ) === 'string' )
      factory = widget.layout.registry[ factory ];

    var handler = factory || widget.layout.registry[w.layout.rendererKey] || defaultHandler;
    w.view = $.isFunction( handler ) ? handler( w ) : null;

    if( w.options.styleClass )
    {
      w.view.addClass( widget.util.expandPath( w.options.styleClass ) );
    }
    
    if( w.data && w.data._vuid )
      w.view.addClass( w.data._vuid );

    
    if( w.view.update )
      w.view.on( 'widget-update', w.view.update );
    
    lifecycle( 'layout', w );
        
    if( w.view && w.options.events )
    {
      if( w.options.events.mouseenter || w.options.events.mouseleave )
      {
        w.view.addClass( 'widget-rollover' );
        w.view.on( 'mouseenter', function() { w.view.toggleClass( 'widget-rollover-on', true ); } );
        w.view.on( 'mouseleave', function() { w.view.toggleClass( 'widget-rollover-on', false ); } );
      }
        
      if( w.options.events.click )
        w.view.addClass( 'widget-clickable' );
      
      bindIf( 'mouseenter', w.view, w.options.events, w );
      bindIf( 'mouseleave', w.view, w.options.events, w );
      bindIf( 'click', w.view, w.options.events, w );
    }

    lifecycle( 'ready', w );
    return w.view;
  }
  
  function callEvent( events, key, context, event )
  {
    if( events && events[key] && $.isFunction( events[key]) )
    {
      return events[key]( context, event );
    }
  }
  
  function bindIf( key, view, events, context )
  {
    if( events && events[key] )
      view.on( key, function( event ) { callEvent( events, key, context, event ); } );
  }
  
  function lifecycle( eventKey, w )
  {
    return callEvent( w.options.events, eventKey, w, {
      type: 'lifecycle.'+eventKey
    } );
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

  var self = function layout( parent, data, options, stack ) {
    return dispatch( parent, data, self.getOptions( data.type, options ), self.registry.error, stack );
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
  self.createCooperativeFrame = createCooperativeFrame;
  
  self.getOptions = function getOptions( type, values )
  {
    return $.extend( {}, self.defaults[type]||{}, values||{} );
  };
  
  return self;
})();
