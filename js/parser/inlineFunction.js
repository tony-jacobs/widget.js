(function registerFunctionProcessor() {

  widget.parser.register( 'inlineFunction', {
    prefix: '=',
    doc: {
      name: "={<i>function</i>}"
    },
    processor: processInlineFunction
  });

  function processInlineFunction( token, str, context ) 
  {
    /* jshint ignore:start */
    var f = new Function( "data", token );
    /* jshint ignore:end */
    var data = context||widget.util.get( 'stack', 0 );
    return f( data );
  }

})();