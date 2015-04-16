(function sparkline(){
  
  widget.ChartFactory.registerChart( 'sparkline', createSparkline );


  function createSparkline( factory, options ) {
    var data = options.data;
    var parentSelector = options.parent;
    var chartId = factory.createChartNode( parentSelector, 'sparkline', 'svg' );
    
    var width = options.width || 200;
    var height = options.height || 30;
    
    factory.charts[ chartId ] = nv.addGraph(function() {
      var chart = nv.models.sparkline();
      chart.width( width );
      chart.height( height );
  
      var domSelector = '#'+chartId;
      var dataSet = factory.attachDataSource( data, domSelector, chartId, options.maxDataCount );  
    
      d3.select( domSelector )
        .datum( dataSet )
        .style( {width:width+'px', height:height+'px'} )
        .transition().duration(250)
        .call(chart);
  
      factory.charts[ chartId ] = chart;
      return chart;
    });
  }

})();