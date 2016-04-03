(function registerRenderLayout(){

  var dispatch = widget.layout.register( 'renderer', createRendererView, {
    description: "Creates a dynamic renderer via indirection, allowing complex data structures"
  } );

  function getRendererLayout( def )
  {
    var key = 'staticRenderer';
    var renderer = widget.get( def.layout, key );
    if( !renderer )
    {
      key = widget.get( def.layout, 'dynamicRenderer', 'Unknown Type' );
      if( 'object'==$.type(key) )
      {
        var dynamicKey = widget.util.expandPath( widget.get( def.layout, 'dynamicRendererKey', 'default' ), def.data );
        key = key[ dynamicKey ];
      }
      key = widget.util.expandPath( key, def.data );
      renderer = widget.util.get( 'renderers', key );
    }

    return {
      key: key,
      layout: renderer
    };
  }

  function renderPanel( def, renderer, key, panel )
  {
    def._currentRendererKey = key;

    if( panel )
      panel.empty().removeClass();
    else
      panel = $('<div/>' );

    panel.addClass( 'renderer' );
    if( key != 'staticRenderer' )
      panel.addClass( key );

    if( renderer && renderer.layout )
    {
      var dataStack = widget.util.getData( 'stack', [] );

      var dataPopCount = 1;
      dataStack.unshift( def.data );
      if( def.layout.data )
      {
        dataStack.unshift( def.layout.data );
        dataPopCount++;
      }

      var rendererOptions = $.extend( {}, renderer.options||{}, {
        rendererKey: key||'static'
      } );

      var optionsStack = widget.util.getData( 'meta', [] );
      optionsStack.push( rendererOptions );

      var rendererData = $.extend( {}, renderer.layout );

      var rendererView = dispatch( panel, rendererData, rendererOptions, undefined, dataStack );

      optionsStack.pop();
      for( var i=0; i<dataPopCount; i++ )
        dataStack.pop();
    }
    else
    {
      var errorMessage;
      try {
        errorMessage = JSON.stringify(def.data||{});
      } catch( e ) {
        console.warn( "Renderer error", e, def );
        errorMessage = "ERROR: See console ("+e+")";
      }

      panel.append( $('<div/>', {text: key } ).addClass('title') );
      panel.append( $('<div/>', {text: errorMessage } ).addClass('data') );
    }


    return panel;
  }

  function createRendererView( def )
  {
    var oldKey = def._currentRendererKey;

    var info = getRendererLayout( def );
    var panel = renderPanel( def, info.layout, info.key );

    panel.update = function updateRenderer( event, context ) {
      var newInfo = getRendererLayout( def );
      if( def._currentRendererKey != newInfo.key )
      {
        renderPanel( def, newInfo.layout, newInfo.key, panel );
      }
    };

    panel.appendTo( def.parent );
    return panel;
  }

})();
