(function registerRenderLayout(){
  
  var dispatch = widget.layout.register( 'renderer', createRendererView, {
    description: "Creates a dynamic renderer via indirection, allowing complex data structures"
  } );

  function createRendererView( def )
  {
    var view = def.parent;
    var data = def.layout;
    var options = def.options;
    
    var renderer = widget.get( data, 'staticRenderer' );
    var key;
    if( !renderer )
    {
      key = widget.get( data, 'dynamicRenderer', 'Unknown Type' );
      renderer = widget.util.get( 'renderers', key );
    }
    
    var panel = $('<div/>' ).addClass( 'renderer' ).appendTo( view );
    if( key )
      panel.addClass( key );
      
    if( renderer && renderer.layout )
    {
      var dataStack = widget.util.getData( 'stack', [] );
      dataStack.unshift( def.data );

      var rendererOptions = $.extend( {}, renderer.options||{}, {
        rendererKey: key||'static'
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