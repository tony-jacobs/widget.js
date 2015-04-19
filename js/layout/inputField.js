(function registerInputFieldLayout(){
  
  widget.layout.register( 'inputField', createInputField, {
    description: "TODO!"
  } );


  function createInputField( view, data, options )
  {
    var fieldKey = (data.dataSource.path).replace( /\./g, "_" );
    var panel = $('<div/>' ).addClass( 'inputFieldHolder' ).appendTo( view );
    var field = $('<input>').attr( {
      id: fieldKey,
      name: fieldKey,
      placeholder: data.placeholder
    }).addClass( options.styleClass || 'inputField' ).appendTo( panel );

    if( options.readonly )
      field.addClass('readonly').prop( 'readonly', options.readonly );

    var sourceData = widget.util.get( data.dataSource.type, data.dataSource.path );
    if( sourceData )
      field.val( sourceData );

    field.on( 'propertychange keyup input paste', function(){
      widget.util.set( data.dataSource.type, data.dataSource.path, field.val() );
    });

    return panel;
  }

})();