(function lineChart(){
  
  widget.ChartFactory.registerChart( 'line', createLineChart );
  
  
  var formatters = {
    date: function(d) {
      return d3.time.format('%b %d')(new Date(d));
    },

    'default': function(d) {
      return d.toFixed(0);
    }
  };
  
  function getFormatter( fmt ) {
    if( $.isFunction( fmt ) )
      return fmt;
    else
      return formatters[fmt] || formatters['default'];
  }

  function createLineChart( factory, options ) {
    
    var chartId = factory.createChartNode( options, 'line', 'svg' );
    var domSelector = '#'+chartId;
    
    options = $.extend( {
      width: 350,
      height: 350,
      leftMargin: 50,
      rightMargin: 50,
      interactive: 'guideline',
      showXAxis: true,
      showYAxis: true,
      showLegend: true,
      xFormat: 'date',
      yFormat: 'default'
    }, options );
  
    var height = $.isNumeric(options.height) ? options.height+'px' : options.height;
    var width = $.isNumeric(options.width) ? options.width+'px' : options.width;

    var chartPromise = $.Deferred();
    nv.addGraph( function() {
      
      var dataProjection = [];
      
      $.each( options.data, function( key, dataHolder ) {
        
        if( $.isArray( dataHolder ) || $.isFunction( dataHolder ) )
        {
          var datum = {
            key: key,
            values: factory.attachDataSource( dataHolder, domSelector, chartId )
          };
          dataProjection.push( datum );
        }
      });
      
      var chart = nv.models.lineChart()
        .id( 'line-chart' )
        .margin({
          left: options.leftMargin,
          right: options.rightMargin
        }) 
        .useInteractiveGuideline( (options.interactive=='guideline')?true:false )
        .showLegend( options.showLegend?true:false )
        .showYAxis( options.showYAxis?true:false )
        .showXAxis( options.showXAxis?true:false )
        .interactive( (options.interactive=='hover')?true:false )
      ;
      
      chart.xAxis.tickFormat( getFormatter( options.xFormat ) );
      chart.yAxis.tickFormat( getFormatter( options.yFormat ) );


      if( options.title )
        $( '<div/>', {html: options.title} ).addClass( 'chartTitle' ).prependTo( options.parent );
  
      d3.select( domSelector )
        .style( {width:width, height:height} )
        .datum( dataProjection )
        .call( chart )
      ;

      // This logic requires NVD3 v1.8.1 or later.
      if( options.interactive=='guideline' && options.events )
      {
        var data;
        var chartView = $(domSelector);
        if( $.isFunction( options.events.rollover ) )
        {
          chartView.on( 'mousemove', function( event ){ 
  
            var oldData = data;
            if( $( '.nv-guideline', chartView ).length )
              data = chart.interactiveLayer.tooltip.data();
            else
              data = null;
            
            // fire event if the index changed, or the value went to or from null.
            if( ( !data && oldData ) || (data && (!oldData || (oldData.index != data.index) ) ) )
              options.events.rollover( options, data );
          } );
        }
        if( $.isFunction( options.events.select ) )
        {
          chartView.on( 'click', function( event ){ 
  
            if( $( '.nv-guideline', chartView ).length )
              data = chart.interactiveLayer.tooltip.data();
            else
              data = null;
            
            options.events.select( options, data );
          } );
        }
      }
      
      factory.charts[ chartId ] = chart;
      chart.domSelector = domSelector;
      chartPromise.resolve( chart );
    });
    
    return chartPromise;
  }
})();