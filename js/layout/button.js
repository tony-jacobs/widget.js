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
    
    var button = $('<button/>', {text: widget.util.expandPath( data.name, def.stack[0] )} ).appendTo( view );

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
      console.warn( "Button Action not found:", data.action );

    return button;
  }

})();