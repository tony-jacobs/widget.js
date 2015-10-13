(function pieChart(){
  
  widget.ChartFactory.registerChart( 'pie', createPie );


  function createPie( factory, options ) {
    
    var chartId = factory.createChartNode( options, 'pie', 'svg' );
    var domSelector = '#'+chartId;
  
    var height = options.height || 350;
    var width = options.width || 350;
    
    var chartPromise = $.Deferred();
    nv.addGraph( function() {
      
      var dataProjection = [];
      
      $.each( options.data, function( key, dataHolder ) {
        var dataSet = dataHolder();
        var datum = {
          key: widget.util.expandPath( '_{'+ key.replace(/\./g, "_") +'}' ),
          y: dataSet[ dataSet.length-1 ].y
        };
        
        dataHolder.subscribe( function( oldValue ) {
          datum.y = dataSet[ dataSet.length-1 ].y;
          d3.select( domSelector ).call( factory.charts[ chartId ] );
        });
        
        dataProjection.push( datum );
      });
      
      
      var pieChart = nv.models.pieChart();
      pieChart.x( function(d) {
        return d.key; 
      });
      pieChart.y( function(d) { 
        return d.y;
      });
      pieChart.width(width);
      pieChart.height(height);
      pieChart.padAngle( options.padAngle || 0 );
      pieChart.cornerRadius( options.cornerRadius || 0 );
      pieChart.id( 'pie-chart' );

      pieChart.showLegend( options.showLegend===undefined ? true : options.showLegend );  
      pieChart.legendPosition( options.legendPosition===undefined ? 'top' : options.legendPosition );  
      pieChart.showLabels( options.showLabels===undefined ? true : options.showLabels );

      if( options.title )
        $( '<div/>', {html: options.title} ).addClass( 'chartTitle' ).prependTo( options.parent );

      d3.select( domSelector )
        .style( {width:width+'px', height:height+'px'} )
        .datum( dataProjection )
        .transition().duration( options.transtitionDuration||600 )
        .call( pieChart );
  
      factory.charts[ chartId ] = pieChart;
      pieChart.domSelector = domSelector;
      chartPromise.resolve( pieChart );
    });
    
    return chartPromise;
  }


})();