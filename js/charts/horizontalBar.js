(function horizontalBararChart(){
  
  widget.ChartFactory.registerChart( 'horizontalBar', createHorizontalBarChart );
  


  function createHorizontalBarChart( factory, options ) {
    
    var chartId = factory.createChartNode( options, 'horizontalBar', 'svg' );
    var domSelector = '#'+chartId;
  
    var height = options.height || 350;
    var width = options.width || 350;
    
    var chartPromise = $.Deferred();
    nv.addGraph( function() {
      
      var dataValues = [];
      var dataProjection = [{
        key: "data",
        values: dataValues
      }];
      
      var i=1;
      $.each( options.data, function( key, dataHolder ) {
        var dataSet = dataHolder();
        var datum = {
          key: key,
          y: dataSet[ dataSet.length-1 ].y
        };
        
        dataHolder.subscribe( function( oldValue ) {
          datum.y = dataSet[ dataSet.length-1 ].y;
          d3.select( domSelector ).call( factory.charts[ chartId ] );
        });
        
        dataValues.push( datum );
      });
      
      var barChart = nv.models.multiBarHorizontalChart();
      barChart.width( width );
      barChart.height( height );
      barChart.x(function(d) { 
        return d.key;
      });
      barChart.y(function(d) { 
        return d.y; 
      });
  
      barChart.showValues( !options.hideValues );
      barChart.showLegend( false );
      barChart.showControls( false );
  
      barChart.id( 'horizontal-bar-chart' );
        
      if( options.title )
        barChart.title( options.title );
  
      d3.select( domSelector )
        .style( {width:width+'px', height:height+'px'} )
        .datum( dataProjection )
        .transition().duration( options.transtitionDuration||600 )
        .call( barChart )
      ;
  
      factory.charts[ chartId ] = barChart;
      barChart.domSelector = domSelector;
      chartPromise.resolve( barChart );
    });
    
    return chartPromise;
  }

})();