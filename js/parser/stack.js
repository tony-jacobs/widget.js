(function registerStackProcessor() {

  widget.parser.register( 'stack', {
    prefix: '$',
    doc: {
      name: "${<i>variable</i>}"
    },
    processor: processStackTemplate
  });
    
  function processStackTemplate( token, str, context ) {
    var result = [];
    
    var i = str.indexOf( token );
    if( i>2 )
      result.push( str.substring( 0, i-2 ) );

    result.push( widget.parser.decode(token, context) );

    if( str.length > (i + token.length + 1) )
    {
      result = result.concat( widget.parser.expandPath( str.substring( i + token.length + 1 ) ) );
    }
    
    return result;
  }
})();