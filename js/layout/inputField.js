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
    var panel = $('<div/>' ).appendTo( view );
    var field = $('<input>').attr( {
      id: fieldKey,
      name: fieldKey,
      placeholder: data.placeholder
    }).addClass( 'inputField' ).appendTo( panel );

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