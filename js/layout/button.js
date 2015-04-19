(function registerButtonLayout(){
  
  widget.layout.register( 'button', createButtonView, {
    description: "TODO!"
  } );

  function createButtonView( view, data, options ) {
    var button = $('<div/>', {text: data.name} ).addClass( options.styleClass || 'dataButton' ).appendTo( view );

    var actionContext = widget.util.get( 'actionManager', data.action );
    if( actionContext )
    {
      button.toggleClass( 'disabled', !actionContext.enabled );
      button.addClass( 'unselectable clickable' ).on( 'click', function(){
        if( actionContext.enabled )
          actionContext.action();
      });

      widget.util.watch( 'actionManager', data.action, function() {
        button.toggleClass( 'disabled', !actionContext.enabled );
      });
    }
    else
      console.warn( "Unbound Action", data.action );

    return button;
  }

})();