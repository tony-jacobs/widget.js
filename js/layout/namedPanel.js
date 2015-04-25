(function registerNamedPanelLayout(){
  
  var dispatch = widget.layout.register( 'namedPanel', createNamedPanelView, {
    description: "TODO!"
  }, {
    styleClass: 'namedPanel'
  } );

  function createNamedPanelView( def )
  {
    var parent = def.parent;
    var panelData = def.layout;
    var options = def.options;
    
    var panel = $('<div/>' );
    var panelTitle = $('<div/>', {text: panelData.name } ).addClass( 'unselectable ' + (options.titleClass||'panelTitle'));
    panel.append( panelTitle );

    var expandedClass = options.expandedClassName || 'expanded';
    if( options.expandable )
    {
      panel.addClass( 'expandablePanel' );
      panelTitle.addClass( 'clickable' ).on( 'click', function() {
        panel.toggleClass( expandedClass );
      });
    }
    if( options.isExpanded )
      panel.addClass( expandedClass );

    var content = dispatch( panel, panelData.content, options, function( view, data, options ) {
      return $('<div/>', {text: data} ).appendTo( view );
    });
    content.addClass( 'panelContent' );

    if( content.children().length===0 && options.hideOnEmpty )
      return null;
    else
    {
      parent.append( panel );
      return panel;
    }
  }

})();