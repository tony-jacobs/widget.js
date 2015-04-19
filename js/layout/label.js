(function registerLabelLayout(){
  
  widget.layout.register( 'label', createLabelView, {
    description: "TODO!"
  } );


  function createLabelView( view, data, options ) {
    var name = widget.util.expandPath( data.name );

    var label = $('<div/>', {html: name} ).addClass( 'dataLabel' ).addClass('unselectable');
    if( options.styleClass )
      label.addClass( options.styleClass );
      
    if( data.action )
    {
      label.addClass( 'clickable' ).click( data.action );
    }
      
    return label.appendTo( view );
  }

})();