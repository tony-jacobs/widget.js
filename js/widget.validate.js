(function validationClosure(){

  // http://stackoverflow.com/questions/46155/validate-email-address-in-javascript
  var emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;


  var Validate = function(){
  };

  Validate.prototype.email = function email( emailAddress ) {
    return emailRegex.test( emailAddress );
  };

  widget.validate = new Validate();

})();
