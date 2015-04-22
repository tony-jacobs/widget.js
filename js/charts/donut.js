(function donutChart(){
  
  widget.ChartFactory.registerChart( 'donut', createDonut );


  function createDonut( factory, options ) {
    
    var chartId = factory.createChartNode( options, 'donut', 'svg' );
    var domSelector = '#'+chartId;
  
    var height = options.height || 350;
    var width = options.width || 350;
    
    factory.charts[ chartId ] = nv.addGraph( function() {
      
      var dataProjection = [];
      
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
        
        dataProjection.push( datum );
      });
      
      
      var donutChart = nv.models.pieChart();
      donutChart.x( function(d) {
        return d.key; 
      });
      donutChart.y( function(d) { 
        return d.y;
      });
      donutChart.donut(true);
      donutChart.width(width);
      donutChart.height(height);
      donutChart.padAngle( options.padAngle || 0.08 );
      donutChart.cornerRadius( options.cornerRadius || 5 );
      donutChart.id( 'donut-chart' );
        
      if( options.title )
        donutChart.title( options.title );
  
      donutChart.pie.donutLabelsOutside(true);
      
      d3.select( domSelector )
        .style( {width:width+'px', height:height+'px'} )
        .datum( dataProjection )
        .transition().duration( options.transtitionDuration||600 )
        .call( donutChart );
  
      factory.charts[ chartId ] = donutChart;
      return donutChart;
    });
  }


})();