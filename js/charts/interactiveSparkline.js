(function interactiveSparkline(){
  
  widget.ChartFactory.registerChart( 'interactiveSparkline', createInteractiveSparkline );


  function createInteractiveSparkline( factory, options ) {
    var data = options.data;
    var chartId = factory.createChartNode( options, 'interactivesparkline', 'svg' );
  
    var chartPromise = $.Deferred();
    nv.addGraph(function() {
      var chart = nv.models.sparklinePlus();
      
      var domSelector = '#'+chartId;
      var dataSet = factory.attachDataSource( data, domSelector, chartId, options.maxDataCount );  
      
      chart.margin({left: 200});
      chart.x( function(d,i) { 
        return i;
      });
      chart.xTickFormat( function(d) {
        return d3.time.format('%c')(  new Date( dataSet[d].x) );
      });
      
      chart.yTickFormat( function(d) {
        return d.toFixed(2) + "%";
      });
        
      d3.select( domSelector )
        .datum( dataSet )
        .transition().duration(250)
        .call(chart);
  
      factory.charts[ chartId ] = chart;
      chartPromise.resolve( chart );
    });

    return chartPromise;
  }

})();