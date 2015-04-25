(function registerContentLayout(){
  
  widget.layout.register( 'content', createContentView, {
    description: "TODO!"
  },
  {
    styleClass: 'dataContent'
  });

  function createContentView( def )
  {
    var view = def.parent;
    var data = def.layout;
    var options = def.options;
    
    var name = widget.util.expandPath( data.name );

    var content = $('<div/>', {html: name} );
      
    if( data.action )
    {
      content.addClass( 'clickable' ).click( data.action );
    }
      
    widget.ui.addAnchorSupport( content );
          
    return content.appendTo( view );
  }

})();