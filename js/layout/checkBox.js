(function registerCheckBoxLayout(){
  
  widget.layout.register( 'checkBox', checkBoxView, {
    description: "TODO!"
  }, 
  {
    styleClass: 'dataCheckBox'
  });

  function checkBoxView( view, data, options ) {
    var label = $('<div/>', {html: data.name} ).appendTo( view );

    if( data.excerpt )
      $('<div/>', {html: data.excerpt} ).addClass( options.excerptStyleClass || 'excerpt' ).appendTo( label );

    label.addClass( 'unselectable clickable' ).on( 'click', function(){
      label.toggleClass( 'selected' );
      widget.util.set( data.dataSource.type, data.dataSource.path, label.hasClass('selected') );
    });

    var sourceData = widget.util.get( data.dataSource.type, data.dataSource.path, false );
    if( sourceData )
      label.toggleClass( 'selected', true );

    if( data.dataSource.storeType )
    {
      widget.util.set( data.dataSource.storeType, data.dataSource.path, data );
    }

    return label;
  }

})();