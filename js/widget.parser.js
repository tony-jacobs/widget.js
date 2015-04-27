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
        var i = str.indexOf( token );
        if( i>2 )
          result.push( str.substring( 0, i-2 ) );
    
        var expansion = tokenImpl.processor( token, context, str );
        if( $.type(expansion) == 'array' )
          result.push.apply( result, expansion );
        else
          result.push( expansion );

        if( str.length > (i + token.length + 1) )
        {
          result = result.concat( expandTokens( str.substring( i + token.length + 1 ), context ) );
        }

        done = true;
      }
    }
    
    if( !done )
      result.push( str );

    return result.join('');
  }


  return {
    expandPath: expandTokens,
    registry: tokens,
    register: function( key, impl ) {
      tokens[ key ] = impl;
    }
  };
})();

