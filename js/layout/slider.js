(function registerSliderInputLayout(){
  
  widget.layout.register( 'slider', createSliderInput, {
    description: "Creates an HTML5 slider control"
  }, {
    styleClass: 'sliderInputHolder'
  } );


  function createSliderInput( def )
  {
    var view = def.parent;
    var data = def.layout;
    var options = def.options;
    
    var typeKey = data.dataSource ? data.dataSource.type : undefined;
    var dataPath = data.dataSource ? data.dataSource.path : "slider";
    
    var fieldKey = (dataPath).replace( /\./g, "_" );
    var panel = $('<div/>' );
    
    var field = $('<input>').attr( {
      id: fieldKey,
      name: fieldKey,
      type: 'range',
      min: options.minValue || 0,
      max: options.maxValue || 100,
      step: options.stepSize || 1,
    }).addClass( 'slider' );
    panel.append( field );


    var sourceData = typeKey ? widget.util.get( typeKey, dataPath ) : widget.get( def.stack[1], dataPath );
    if( sourceData )
      field.val( sourceData );
    else if( sourceData === undefined && options.autoHide )
      return null;
      
    formatReadout = options.formatReadout || function defaultSliderReadoutFormat( value ) {
      return value;
    };
    
    var readout;
    console.log( "options", options );
    if( options.readout )
    {
      readout = $('<span></span>', { 
        html: formatReadout( field.val() )
      } );
      readout.addClass( options.readoutStyleClass || 'sliderReadout' );
      panel.append( readout );
    }

    field.on( 'input', function( event ){
      var oldVal = typeKey ? widget.util.get( typeKey, dataPath ) : widget.get( def.stack[1], dataPath );
      var newVal = field.val();
      if( typeKey )
        widget.util.set( typeKey, dataPath, newVal ) ;
      else
        widget.set( def.stack[1], dataPath, newVal );
        
      if( oldVal != newVal )  
        panel.trigger( 'fieldChange', { oldVal: oldVal, newVal: newVal } );
      
      if( readout )
        readout.html( formatReadout( newVal ) );
    });

    if( data.label )
    {
      panel.prepend( $('<label/>', { html: data.label } ) );
    }

    if( data.dataSource )
    {
      panel.update = function updateCheckbox( event, context ) {
        var curr = (typeKey ? widget.util.get( typeKey, dataPath ) : widget.get( def.stack[1], dataPath ));
        field.val( curr );
      };
    }

    panel.appendTo( view );
    return panel;
  }

})();