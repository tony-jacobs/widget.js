(function registerChartLayout(){
  
  widget.layout.register( 'chart', createChartView, {
    description: "Renders a chart",
    data: {
      chartType: "One of the available chart types",
      dataSource: "Data source, as processed by widget.util.get() -- defaults to 'data'",
      dataSeriesKey: "Data path within the data source for this series"
    }
  },
  {
    styleClass: 'chart'
  });


  function createChartView( def )
  {
    var view = def.parent;
    var data = def.layout;
    var options = def.options;
    
    var panel = $('<div/>' ).appendTo( view );
    if( options.chartId )
      panel.attr( 'id', options.chartId );
    
    var chartData;
    if( def.layout.data )
    {
      chartData = def.layout.data;
    }
    else
    {
      var dataSeriesKey = widget.util.expandPath( data.dataSeries );
      chartData = widget.util.get( data.dataSource||'data', dataSeriesKey );
    }

    var chartOptions = $.extend( {}, options, {
      type:data.chartType, 
      data:chartData, 
      parent:panel
    });
    
    var chartPromise = widget.chartFactory.create( chartOptions );
    chartPromise.then( function( chart ) {
      panel.on( 'refreshData', function updateChart( event, context ) {
        if( chart && chart.domSelector )
          d3.select( chart.domSelector ).call( chart );
      } );
    });
    
    return panel;
  }

})();