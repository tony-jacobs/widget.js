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
      
      
      if( options.valueFormat )
        pieChart.valueFormat( options.valueFormat );
        
      if( options.colors )
        pieChart.color( options.colors );

      if( options.title )
        $( '<div/>', {html: options.title} ).addClass( 'chartTitle' ).prependTo( options.parent );

      if( options.legendLineHeight )
      {
        pieChart.dispatch.on( 'renderEnd', function( model ){
          var pie = d3.select( domSelector + ' .nv-pieChart' );
          var labelHeight = pie.node().getBBox().height / 4;
          var labels = d3.select( domSelector ).selectAll( domSelector + ' g.nv-series' );
          
          labels.each( function (d, i) {
            d3.select(this).attr('transform', function () {
              return 'translate( 0,' + (options.legendLineHeight/2 + (i * options.legendLineHeight)) + ')';
            });
          });
        });
      }

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