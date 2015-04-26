widget.parser = (function(){
  
  var tokens = {};

  function getToken( flavor, str )
  {
    if( str )
    {
      var front = -1;
      var opens = 0;

      for( var i=0; i<str.length; i++ )
      {
        var ch = str.charAt(i);
        if( (ch === flavor ) && (str.charAt( i+1 ) == '{') )
        {
          if( front < 0 )
            front = i+2;
          opens += 1;
        }
        else if( ch == '}' )
        {
          opens -= 1;
          if( opens === 0 )
            return str.substring( front, i );
        }
      }
    }
    return null;
  }

  function decode( token, context )
  {
    token = expandTokens(token);
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

  /**
   * Decodes an expression such as ${name} or ={return 'foo';}
   * @param str - The expression that may contain valid expandable tokens
   * @param context - The value to use as a data context
   **/
  function expandTokens( str, context )
  {
    var result = [];
    var done = false;
    
    for( var key in tokens )
    {
      var tokenImpl = tokens[ key ];
      var token = getToken( tokenImpl.prefix, str );
      if( token )
      {
        var expansion = tokenImpl.processor( token, str, context );
        if( $.type(expansion) == 'array' )
          result.push.apply( result, expansion );
        else
          result.push( expansion );
          
        done = true;
      }
    }
    
    if( !done )
      result.push( str );

    return result.join('');
  }


  return {
    expandPath: expandTokens,
    decode: decode,
    registry: tokens,
    register: function( key, impl ) {
      tokens[ key ] = impl;
    }
  };
})();

