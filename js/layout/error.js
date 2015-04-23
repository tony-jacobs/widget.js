(function registerErrorLayout(){
  
  widget.layout.register( 'error', createErrorView, {
    description: "Default panel displayed when an error is encountered"
  } );

  function detectCircularReferences(censor) {
    var i = 0;
  
    return function(key, value) {
      if(i !== 0 && typeof(censor) === 'object' && typeof(value) == 'object' && censor == value) 
        return '[Circular]'; 
  
      if(i >= 29) // seems to be a harded maximum of 30 serialized objects?
        return '[Unknown]';
  
      ++i; // so we know we aren't using the original object anymore
  
      return value;  
    };
  }
  
  function toJson( o )
  {
    return JSON.stringify( o, detectCircularReferences(o), 2 );
  }

  function createErrorView( view, data, options ) 
  {
    console.error( "Error!", view, data, options );
    var panel = $('<div/>' ).addClass( 'errorPanel' ).appendTo( view );
    panel.append( $('<div/>', {text: 'Error:' } ).addClass('title') );
    panel.append( $('<pre/>', {text: toJson( data ) } ).addClass('errorData') );
    panel.append( $('<pre/>', {text: toJson( options ) } ).addClass('errorOptions') );
    return panel;
  }
})();