(function registerButtonLayout(){
  
  widget.layout.register( 'button', createButtonView, {
    description: "TODO!"
  },
  {
    styleClass: 'dataButton'
  });

  function createButtonView( def )
  {
    var view = def.parent;
    var data = def.layout;
    var options = def.options;
    
    var button = $('<div/>', {text: data.name} ).appendTo( view );

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