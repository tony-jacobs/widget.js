(function validationClosure(){

  // http://stackoverflow.com/questions/46155/validate-email-address-in-javascript
  var emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  var factory = {
    equals: function createEqualsValidator( opts ) {
      return function( value, context ) {
        return value == widget.util.expandPath( opts, context.stack[1] );
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
    return ( value && value.trim().length > 0 );
  };

  Validate.prototype.create = function validatorFactory( key, opts ) {
    return $.isFunction( factory[key] ) ? factory[key]( opts ) : (this[key] || this.any);
  };

  widget.validate = new Validate();

})();
