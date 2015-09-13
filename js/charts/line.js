(function lineChart(){
  
  widget.ChartFactory.registerChart( 'line', createLineChart );
  

  /**
   * This thing is kinda buggy, but it does do the line chart bits, so I'm
   * leaving it in.
   **/
  function createLineChart( factory, options ) {
    
    var chartId = factory.createChartNode( options, 'line', 'svg' );
    var domSelector = '#'+chartId;
  
    var height = options.height || 350;
    var width = options.width || 350;
    
    var chartPromise = $.Deferred();
    nv.addGraph( function() {
      
      var dataProjection = [];
      
      $.each( options.data, function( key, dataHolder ) {
        var datum = {
          key: key,
          values: factory.attachDataSource( dataHolder, domSelector, chartId )
        };
        dataProjection.push( datum );
      });
      
      var lineChart = nv.models.lineChart();

      lineChart.id( 'line-chart' );
      lineChart.interactive( false );
        
      if( options.title )
        lineChart.title( options.title );
  
      d3.select( domSelector )
        .style( {width:width+'px', height:height+'px'} )
        .datum( dataProjection )
        .transition().duration( options.transtitionDuration||600 )
        .call( lineChart )
      ;
  
      factory.charts[ chartId ] = lineChart;
      lineChart.domSelector = domSelector;
      chartPromise.resolve( lineChart );
    });
    
    return chartPromise;
  }

})();