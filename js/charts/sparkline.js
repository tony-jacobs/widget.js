(function sparkline(){
  
  widget.ChartFactory.registerChart( 'sparkline', createSparkline );


  function createSparkline( factory, options ) {
    var data = options.data;
    var parentSelector = options.parent;
    var chartId = factory.createChartNode( parentSelector, 'sparkline', 'svg' );
    
    factory.charts[ chartId ] = nv.addGraph(function() {
      var chart = nv.models.sparkline();
      chart.width( 200 );
      chart.height( 30 );
  
      var domSelector = '#'+chartId;
      var dataSet = factory.attachDataSource( data, domSelector, chartId );  
    
      d3.select( domSelector )
        .datum( dataSet )
        .transition().duration(250)
        .call(chart);
  
      factory.charts[ chartId ] = chart;
      return chart;
    });
  }

})();