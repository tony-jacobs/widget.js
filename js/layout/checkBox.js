(function registerCheckBoxLayout(){
  
  widget.layout.register( 'checkBox', checkBoxView, {
    description: "TODO!"
  }, 
  {
    styleClass: 'dataCheckBox'
  });

  function checkBoxView( def )
  {
    var view = def.parent;
    var data = def.layout;
    var options = def.options;
    
    var label = data.name ? $('<div/>', {html: data.name} ) : $("<label><input type='checkbox'/>" + (data.label||'') +"</label>");

    if( data.excerpt )
      $('<div/>', {html: data.excerpt} ).addClass( options.excerptStyleClass || 'excerpt' ).appendTo( label );

    label.addClass( 'unselectable clickable' ).on( 'click', function( event ){
      label.toggleClass( 'selected' );
      
      if( data.dataSource )
        widget.util.set( data.dataSource.type, data.dataSource.path, label.hasClass('selected') );
      
      event.stopPropagation();
    });

    var sourceData;
    if( data.value !== undefined )
      sourceData = widget.util.expandPath( data.value, def.stack[0] );
    else
      sourceData = widget.util.get( data.dataSource.type, data.dataSource.path, false );
      
    if( sourceData )
    {
      label.toggleClass( 'selected', true );
      label.attr( 'checked', true );
    }

    if( data.dataSource && data.dataSource.storeType )
    {
      widget.util.set( data.dataSource.storeType, data.dataSource.path, data );
    }
    
    return label.appendTo( view );
  }

})();