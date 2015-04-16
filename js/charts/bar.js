(function barChart(){
  
  widget.ChartFactory.registerChart( 'bar', createBarChart );
  


  function createBarChart( factory, options ) {
    
    var chartId = factory.createChartNode( options.parent, 'bar', 'svg' );
    var domSelector = '#'+chartId;
  
    var height = options.height || 350;
    var width = options.width || 350;
    
    factory.charts[ chartId ] = nv.addGraph( function() {
      
      var dataValues = [];
      var dataProjection = [{
        values: dataValues
      }];
      
      $.each( options.dataSeries, function( key, dataHolder ) {
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
      
      var barChart = nv.models.discreteBarChart();
      barChart.x(function(d) { 
        return d.key;
      });
      barChart.y(function(d) { 
        return d.y; 
      });
  
      barChart.staggerLabels( options.staggerLabels );
      barChart.showValues( !options.hideValues );
  
      barChart.id( 'bar-chart' );
        
      if( options.title )
        barChart.title( options.title );
  
      d3.select( domSelector )
        .style( {width:width+'px', height:height+'px'} )
        .datum( dataProjection )
        .transition().duration( options.transtitionDuration||600 )
        .call( barChart )
      ;
  
      factory.charts[ chartId ] = barChart;
      return barChart;
    });
  }

})();