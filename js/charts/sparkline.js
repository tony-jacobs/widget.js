(function sparkline(){
  
  widget.ChartFactory.registerChart( 'sparkline', createSparkline );


  function createSparkline( factory, options ) {
    var data = options.data;
    var chartId = factory.createChartNode( options, 'sparkline', 'svg' );
    
    var width = options.width || 200;
    var height = options.height || 30;
    
    var chartPromise = $.Deferred();
    nv.addGraph(function() {
      var chart = nv.models.sparkline();
      chart.width( width-2 );
      chart.height( height );
  
      chart.color( options.colors || ["#000000"] );
  
      var domSelector = '#'+chartId;
      var dataSet = factory.attachDataSource( data, domSelector, chartId, options.maxDataCount );  
    
      if( dataSet )
      {
        d3.select( domSelector )
          .datum( dataSet )
          .style( {width:width+'px', height:height+'px'} )
          .transition().duration(250)
          .call(chart);
      }
      
      factory.charts[ chartId ] = chart;
      chart.domSelector = domSelector;
      chartPromise.resolve( chart );
    });
    
    return chartPromise;
  }

})();