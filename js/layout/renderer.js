(function registerRenderLayout(){
  
  var dispatch = widget.layout.register( 'renderer', createRendererView, {
    description: "Creates a dynamic renderer via indirection, allowing complex data structures"
  } );

  function createRendererView( view, data, options ) {
    var key = widget.get( data, 'dynamicRenderer', 'Unknown Type' );
    var renderer = widget.util.get( 'renderers', key );
    
    var panel = $('<div/>' ).addClass( 'renderer' ).addClass( key ).appendTo( view );
    
    if( options.styleClass )
      panel.addClass( options.styleClass );

    if( renderer && renderer.layout )
    {
      var dataStack = widget.util.getData( 'stack', [] ); 
      dataStack.push( data );

      var rendererOptions = $.extend( {}, renderer.options||{}, {
        rendererKey: key
      } );

      var optionsStack = widget.util.getData( 'meta', [] ); 
      optionsStack.push( rendererOptions );
      
      var rendererData = $.extend( {}, renderer.layout );

      var rendererView = dispatch( panel, rendererData, rendererOptions, undefined, dataStack );
      
      optionsStack.pop();
      dataStack.pop();
    }
    else
    {
      panel.append( $('<div/>', {text: key } ).addClass('title') );
      panel.append( $('<div/>', {text: JSON.stringify(data) } ).addClass('data') );
    }
    
    if( data.action )
    {
      panel.addClass( 'clickable' ).click( data.action );
    }
    
    return panel;
  }

})();