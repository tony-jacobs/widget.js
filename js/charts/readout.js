(function readoutDisplay(){
  
  widget.ChartFactory.registerChart( 'readout', createReadout );


  function createReadout( factory, options ) {
    var data = options.data;
    var parentSelector = options.parent;
    var format = options.formatter;
    if( !$.isFunction(format) )
    {
      var formatKey = format;
      format = function( val ) {
        return widget.Formatters.format( formatKey, val, true );
      };
    }
    
    var chartId = factory.createChartNode( parentSelector, 'readout', 'div' );
    var domSelector = '#'+chartId;
    var chart = $( domSelector, $(options.parent) )[0];
    
    chart.updateReadout = function updateReadout( oldValue ) {
      var val = dataSet[ dataSet.length-1 ];
      var formatString = format( val.y );

      chart.innerHTML = formatString;
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