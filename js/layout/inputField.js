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
    
    var typeKey = data.dataSource ? data.dataSource.type : undefined;
    
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

    var sourceData = typeKey ? widget.util.get( typeKey, data.dataSource.path ) : widget.get( def.stack[1], data.dataSource.path );
    if( sourceData )
      field.val( sourceData );
    else if( sourceData === undefined && options.autoHide )
      return null;

    field.on( 'propertychange keyup input paste', function( event ){
      var oldVal = typeKey ? widget.util.get( typeKey, data.dataSource.path ) : widget.get( def.stack[1], data.dataSource.path );
      var newVal = field.val();
      if( typeKey )
        widget.util.set( typeKey, data.dataSource.path, newVal ) ;
      else
        widget.set( def.stack[1], data.dataSource.path, newVal );
        
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

    if( data.dataSource )
    {
      panel.update = function updateCheckbox( event, context ) {
        var curr = (typeKey ? widget.util.get( typeKey, data.dataSource.path ) : widget.get( def.stack[1], data.dataSource.path ));
        field.val( curr );
      };
    }

    panel.appendTo( view );
    return panel;
  }

})();