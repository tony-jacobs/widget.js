(function registerLabelLayout(){
  
  widget.layout.register( 'label', createLabelView, {
    description: "TODO!"
  }, {
  } );


  function createLabelView( view, layout, options, def ) {
    var label = $('<div/>' ).addClass( 'dataLabel' ).addClass('unselectable');
      
    if( layout.action )
    {
      label.addClass( 'clickable' ).click( layout.action );
    }

    label.update = function updateLabel( event, context ) {
      if( context && context.stack )
      {
        def.stack = context.stack;
      }

      label.html( widget.util.expandPath( layout.name, def.stack[0] ) );
    };
    
    label.update();
    label.appendTo( view );
    return label;
  }

})();