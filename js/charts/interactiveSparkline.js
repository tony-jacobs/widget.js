(function interactiveSparkline(){
  
  widget.ChartFactory.registerChart( 'interactiveSparkline', createInteractiveSparkline );


  function createInteractiveSparkline( factory, options ) {
    var data = options.data;
    var parentSelector = options.parent;
    var chartId = factory.createChartNode( parentSelector, 'interactivesparkline', 'svg' );
  
    factory.charts[ chartId ] = nv.addGraph(function() {
      var chart = nv.models.sparklinePlus();
      
      var domSelector = '#'+chartId;
      var dataSet = factory.attachDataSource( data, domSelector, chartId );  
      
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
      return chart;
    });
  }

})();