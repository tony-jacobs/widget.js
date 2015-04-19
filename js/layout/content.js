(function registerContentLayout(){
  
  widget.layout.register( 'content', createContentView, {
    description: "TODO!"
  } );

  function createContentView( view, data, options ) {
    var name = widget.util.expandPath( data.name );

    var content = $('<div/>', {html: name} ).addClass( 'dataContent' );
    if( options.styleClass )
      content.addClass( options.styleClass );
      
    if( data.action )
    {
      content.addClass( 'clickable' ).click( data.action );
    }
      
    widget.ui.addAnchorSupport( content );
          
    return content.appendTo( view );
  }

})();