(function registerStackProcessor() {

  widget.parser.register( 'stack', {
    prefix: '$',
    doc: {
      name: "${<i>variable</i>}"
    },
    processor: decode
  });
    
  function decode( token, context )
  {
    token = widget.parser.expandPath(token);
    var sep = token.indexOf( ',' );
    if( sep > -1 )
    {
      var dbName = token.substring( 0, sep );
      var path = token.substring( sep+1 ).split( '|', 2 );
      if( path.length > 1 )
        return widget.util.get( dbName, path[0], path[1] );
      else
        return widget.util.get( dbName, path[0] );
    }
    else
    {
      var stackVal;
      if( context )
      {
        stackVal = widget.get( context, token );
      }
      else
        stackVal = decode( "stack,0." + token );
        
      return stackVal || "${" + token + "}";
    }
  }

})();