(function validationClosure(){

  // http://stackoverflow.com/questions/46155/validate-email-address-in-javascript
  var emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  var factory = {
    exactMatch: function createExactMatch( opts )
    {
      if( $.type(opts)==='string' )
        opts = { selector:opts, other:true };

      return function exactMatchValidator( data, context ) {
        $that = $( opts.selector );

        var isMatch = ($that.val() === data);

        if( opts.other )
        {
          $that.parent().toggleClass( 'invalid', !isMatch );
          return true;
        }
        else
          return isMatch;
      };
    },

    ruleExactMatch: function createRuleExactMatch( opts ) {
      var ruleValidator = widget.validate.create( opts.rule, opts.ruleOpts );
      var peerValidator = widget.validate.create( 'exactMatch', opts.peer );

      return function( value, context, oldValue ) {
        return !!(peerValidator( value, context, oldValue ) & ruleValidator( value, context, oldValue ));
      };
    }
  };

  var Validate = function(){
  };

  Validate.prototype.email = function email( emailAddress ) {
    return emailRegex.test( emailAddress );
  };

  Validate.prototype.any = function any() {
    return true;
  };

  Validate.prototype.nonEmpty = function nonEmpty(value) {
    return (value && value.trim().length > 0 );
  };

  Validate.prototype.create = function validatorFactory( key, opts ) {
    return $.isFunction( factory[key] ) ? factory[key]( opts ) : (this[key] || this.any);
  };

  widget.validate = new Validate();

})();
