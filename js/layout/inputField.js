(function registerInputFieldLayout(){
  
  widget.layout.register( 'inputField', createInputField, {
    description: "TODO!"
  }, {
    styleClass: 'inputFieldHolder'
  } );


  function createInputField( def )
  {
    var view = def.parent;
    var data = def.layout;
    var options = def.options;
    
    var fieldKey = (data.dataSource.path).replace( /\./g, "_" );
    var panel = $('<div/>' );
    
    var field = $('<input>').attr( {
      id: fieldKey,
      name: fieldKey,
      type: data.fieldType || 'text',
      placeholder: data.placeholder
    }).addClass( 'inputField' );

    if( options.readonly )
      field.addClass('readonly').prop( 'readonly', options.readonly );

    var sourceData = widget.util.get( data.dataSource.type, data.dataSource.path );
    if( sourceData )
      field.val( sourceData );
    else if( sourceData === undefined && options.autoHide )
      return null;

    field.on( 'propertychange keyup input paste', function( event ){
      var oldVal = widget.util.get( data.dataSource.type, data.dataSource.path );
      var newVal = field.val();
      widget.util.set( data.dataSource.type, data.dataSource.path, newVal );
        
      if( event.keyCode == 13 )
      {
        panel.trigger( 'enter' );
      }
      else
      {
        if( oldVal != newVal )  
          panel.trigger( 'fieldChange', { oldVal: oldVal, newVal: newVal } );
      }
    });

    if( data.label )
    {
      panel.append( $('<label/>', { html: data.label } ) );
    }
    panel.append( field );

    return panel.appendTo( view );
  }

})();