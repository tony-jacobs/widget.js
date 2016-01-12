(function registerFunctionProcessor() {

  var lang = 'en';

  widget.parser.register( 'localize', {
    prefix: '_',
    doc: {
      name: "={<i>localizable string</i>}"
    },
    recursive: true,
    processor: processLocalizableString
  });

  widget.setLocale = function setLocale( newLocale ) {
    lang = newLocale;
  };

  function processLocalizableString( token, context )
  {
    var db = widget.util.getData( 'localization' );
    var localized = widget.get( db, lang+'.'+token ) || widget.get( db, 'common.'+token, token );

    return widget.util.expandPath( localized, context );
  }

})();
