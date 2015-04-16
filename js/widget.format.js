widget.Formatters = (function(){
  
  function htmlUnit( dataType, value, unit )
  {
    var typeClass = "formatValue" + dataType.charAt(0).toUpperCase() + dataType.slice(1);
    var formattedString = "<span class='formatValue "+typeClass+"'><span class='value'>" + value + "</span><span class='unit'>" + unit + "</span></span>";
    return formattedString;
  }
  
  var registry = {
    'default': function( value ) { 
      return value; 
    },
    
    'percent': function percentFormatter( value ) {
      return (value).toFixed(1) + "%";
    },
    
    'percent.html': function percentFormatter( value ) {
      return htmlUnit( 'percent', (value).toFixed(1), "%" );
    },
  
    htmlUnit: htmlUnit,
    format: function( dataType, value, html )
    {
      var formatter;
      
      if( html && registry[ dataType+'.html' ] )
        formatter = registry[ dataType+'.html' ];
        
      else if( registry[dataType] )
        formatter = registry[dataType];
        
      else 
        formatter = registry['default'];

      //console.log( "Format!", dataType, value, html, formatter, formatter( value ) );
      return formatter( value );
    }
  };
  
  return registry;
})();
