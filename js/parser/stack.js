(function registerStackProcessor() {

  widget.parser.register( 'stack', {
    prefix: '$',
    doc: {
      name: "${<i>variable</i>}"
    },
    recursive: true,
    processor: decode
  });
    
  function decode( token, context )
  {
    var result;
    var sep = token.indexOf( ',' );
    var path;
    if( sep > -1 )
    {
      var dbName = token.substring( 0, sep );
      path = token.substring( sep+1 ).split( '|', 2 );
      result = widget.util.get( dbName, path[0], path[1] );
    }
    else
    {
      context = context || (widget.util.getStack() || [])[0];
      path = token.split( '|', 2 );
      result = widget.get( context, path[0], path[1] );
      if( result === undefined || result === null )
        result = "${" + token + "}";
    }
    
    return $.isFunction(result) ? result.apply( context ) : result;
  }

})();