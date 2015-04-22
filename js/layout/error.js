(function registerErrorLayout(){
  
  widget.layout.register( 'error', createErrorView, {
    description: "Default panel displayed when an error is encountered"
  } );

  function createErrorView( view, data, options ) 
  {
    var panel = $('<div/>' ).addClass( 'errorPanel' ).appendTo( view );
    panel.append( $('<div/>', {text: 'Error:' } ).addClass('title') );
    panel.append( $('<div/>', {text: JSON.stringify( data ) } ).addClass('errorData') );
    panel.append( $('<div/>', {text: JSON.stringify( options ) } ).addClass('errorOptions') );
    return panel;
  }
})();