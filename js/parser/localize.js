(function registerFunctionProcessor() {

  var lang = 'en';

  widget.parser.register( 'localize', {
    prefix: '_',
    doc: {
      name: "_{<i>localizable string</i>}"
    },
    recursive: true,
    processor: processLocalizableString
  });

  widget.setLocale = function setLocale( newLocale ) {
    lang = newLocale;
  };

  function getLocalized( db, path, token )
  {
    for( var i in path )
    {
      var str = widget.get( db, path[i]+'.'+token );
      if( (str !== undefined) && (str !== null) )
        return str;
    }
    return token;
  }

  function processLocalizableString( token, context )
  {
    var i;
    var db = widget.util.getData( 'localization' );

    var codes = lang.split('-');
    var searchPath = ['common'];

    var tmp = codes[0];
    searchPath.unshift( tmp );
    for( i=1; i<codes.length; i++ )
    {
      tmp = tmp +'.' + codes[i];
      searchPath.unshift( tmp );
    }

    return widget.util.expandPath( getLocalized( db, searchPath, token ), context );
  }

})();
