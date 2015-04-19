(function registerChartLayout(){
  
  widget.layout.register( 'chart', createChartView, {
    description: "TODO!"
  } );


  function createChartView( view, data, options ) {
    var panel = $('<div/>' ).addClass( 'chart' ).appendTo( view );
    if( options.chartId )
      panel.attr( 'id', options.chartId );
    
    var dataSeriesKey = widget.util.expandPath( data.dataSeries );
    var chartData = widget.util.get( data.dataSource||'data', dataSeriesKey );

    var chartOptions = $.extend( {}, options, {
      type:data.chartType, 
      data:chartData, 
      parent:panel
    });
    
    widget.chartFactory.create( chartOptions );
    return panel;
  }

})();