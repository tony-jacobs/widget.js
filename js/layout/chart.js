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