widget.parser = (function(){
  
  var tokens = {};

  function tokenize( str )
  {
    for( var i=1; i<str.length; i++ )
    {
      var k = str.charAt(i-1);
      if( str.charAt(i) == '{' && k != ' ' && k != '\\' )
      {
        var open = 1;
        for( var j=i+1; j<str.length; j++ )
        {
          var ch = str.charAt(j);
          if( ch == '{')
            open++;
          else if( ch == '}' )
          {
            open--;
            if( open === 0 )
            {
              var tokens = [];
              if( i>1 )
                tokens.push( str.substring(0,i-1) );
              tokens.push( { flavor:k, token:str.substring(i+1,j) } );
              if( j+1 < str.length )
                tokens.push.apply( tokens, tokenize(str.substring(j+1) ) );
              return tokens;
            }
          }
        }
      }
    }
    return [str];
  }

  /**
   * Decodes an expression such as ${name} or ={return 'foo';}
   * @param str - The expression that may contain valid expandable tokens
   * @param context - The value to use as a data context
   **/
  function expandTokens( str, context )
  {
    if( !str )
      return str;
      
    var t = tokenize( str );
    var result = [];
    
    for( var i=0; i<t.length; i++ )
    {
      if( $.type( t[i] ) === 'string' )
        result.push( t[i] );
      else
      {
        var token = t[i];
        var impl = tokens[ token.flavor ];
        if( impl )
        {
          var body = token.token;
          if( impl.recursive )
            body = expandTokens( body, context );

          result.push( impl.processor( body, context, str ) );
        }
        else
          result.push( token.flavor+"{" + token.token + "}" );
      }
    }

    return result.join('');
  }


  return {
    expandPath: expandTokens,
    registry: tokens,
    register: function( key, impl ) {
      impl.doc = impl.doc || {};
      impl.doc.key = key;
      
      tokens[ impl.prefix ] = impl;
    }
  };
})();
