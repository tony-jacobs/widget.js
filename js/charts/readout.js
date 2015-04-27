(function readoutDisplay(){
  
  widget.ChartFactory.registerChart( 'readout', createReadout );


  function createReadout( factory, options ) {
    var data = options.data;
    var format = options.formatter;
    if( !$.isFunction(format) )
    {
      var formatKey = format;
      format = function( val ) {
        return widget.Formatters.format( formatKey, val, true );
      };
    }
    
    var chartId = factory.createChartNode( options, 'readout', 'div' );
    var domSelector = '#'+chartId;
    var chart = $( domSelector, $(options.parent) )[0];
    
    chart.updateReadout = function updateReadout( oldValue ) {
      if( dataSet )
      {
        var val = dataSet[ dataSet.length-1 ];
        var formatString = format( val.y );
  
        chart.innerHTML = formatString;
      }
      else
        chart.innerHTML = "data error";
    };
  
    var dataSet = data;
    if( typeof data == 'function' )
    {
      data.subscribe( chart.updateReadout );
      dataSet = data();
    }
    
    factory.charts[ chartId ] = chart;
    chart.updateReadout();
    return chart;
  }

})();