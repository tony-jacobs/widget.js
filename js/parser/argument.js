(function registerArgumentProcessor() {

  widget.parser.register( 'argument', {
    prefix: '?',
    doc: {
      name: "?{<i>urlKey</i>}"
    },
    recursive: true,
    processor: decode
  });

  function decode( token )
  {
    var result;
    var path;

    path = token.split( '|', 2 );
    result = widget.get( widget.util.decodeUrlArguments(), path[0], path[1] );
    if( result === undefined || result === null )
      result = "?{" + token + "}";

    return result;
  }

})();
