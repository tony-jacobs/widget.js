(function registerFunctionProcessor() {

  widget.parser.register( 'localize', {
    prefix: '_',
    doc: {
      name: "={<i>localizable string</i>}"
    },
    recursive: true,
    processor: processLocalizbleString
  });

  function processLocalizbleString( token, context ) 
  {
    var db = widget.util.getData( 'localization' );
    var lang = 'en';
    return widget.get( db, lang+'.'+token ) || widget.get( db, 'common.'+token, token );
  }

})();

