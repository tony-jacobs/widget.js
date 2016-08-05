(function registerInputFieldLayout(){

  widget.layout.register( 'inputField', createInputField, {
    description: "TODO!"
  }, {
    styleClass: 'inputFieldHolder'
  } );

  function validate( value, context, oldValue )
  {
    var validator = widget.get( context, "options.validator" );
    if( $.type(validator) === 'string' )
      validator = widget.validate[ validator ];

    if( $.isFunction( validator ) )
    {
      var isValid = validator( value, context, oldValue );
      context.view.toggleClass( 'invalid', !isValid );
    }
  }

  function createInputField( def )
  {
    var view = def.parent;
    var data = def.layout;
    var options = def.options || {};

    var typeKey = data.dataSource ? data.dataSource.type : undefined;

    var fieldKey = data.dataSource ? data.dataSource.path : undefined;
    if( fieldKey )
      fieldKey = fieldKey.replace( /\./g, "_" );

    var panel = $('<div/>' );

    var field = $('<input>').attr( {
      id: fieldKey,
      name: fieldKey,
      type: data.fieldType || 'text',
      placeholder: $('<div/>').html( widget.util.expandPath( data.placeholder, def.stack[1] ) ).text()
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
        {
          $form = options.formKey ?  panel.closest( 'form.'+options.formKey ) : panel.closest( 'form' );
          ( $form.length ? $form : field ).trigger( 'validate' );

          panel.trigger( 'fieldChange', { oldVal: oldVal, newVal: newVal } );
        }
      }
    });

    if( options.validator )
    {
      field.addClass( 'validate' );
      field.on( 'validate', function onValidate() {
        validate( field.val(), def );
        return false;
      } );
    }

    var labelElement;
    if( data.label )
    {
      labelElement = $('<label/>');
      panel.append( labelElement );
      labelElement.html( widget.util.expandPath( data.label, def.stack[1] ) );
    }
    panel.append( field );

    if( data.dataSource )
    {
      panel.update = function updateInputField( event, context ) {
        var newVal = (typeKey ? widget.util.get( typeKey, data.dataSource.path ) : widget.get( def.stack[1], data.dataSource.path ));
        var oldVal = field.val();
        if( oldVal != newVal )
          field.val( newVal );

        field.attr( 'placeholder', $('<div/>').html( widget.util.expandPath( data.placeholder, def.stack[1] ) ).text() );
        if( labelElement )
          labelElement.html( widget.util.expandPath( data.label, def.stack[1] ) );
      };
    }

    panel.appendTo( view );
    return panel;
  }

})();
