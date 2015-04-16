(function readoutDisplay(){
  
  widget.ChartFactory.registerChart( 'readout', createReadout );


  function createReadout( factory, options ) {
    var data = options.data;
    var parentSelector = options.parent;
    var format = options.formatter || function( val ) { return val; };
    
    var chartId = factory.createChartNode( parentSelector, 'readout', 'div' );
    var domSelector = '#'+chartId;
    var chart = d3.select( domSelector )[0][0];
    
    chart.updateReadout = function updateReadout( oldValue ) {
      var val = dataSet[ dataSet.length-1 ];
      chart.innerHTML = format( val.y );
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