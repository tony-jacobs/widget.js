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
  
  function getDataDomain( dataProjection ) {
    var domain = [Infinity,-Infinity];
    for( var key in dataProjection )
    {
      var values = dataProjection[key].values;
      if( values )
      {
        // decompose a knockout value set
        if( $.isFunction( values ) )
          values = values();
        
        if( values[0].x < domain[0] )
          domain[0] = values[0].x;
          
        var last = values.length-1;
        if( values[ last ].x > domain[1] )
          domain[1] = values[last].x;

      }
    }
    return domain;
  }

  function setFocusRange( chart, range ) 
  {
    var domain = getDataDomain( chart.dataProjection );
    if( range === 0 || (domain[1]-range < domain[0]) )
    {
      chart.brushExtent( [0,0] );
      chart.update();
    }      
    else
    {
      chart.brushExtent( [ domain[1]-range, domain[1] ] );
      chart.update();
    }
  }

  function createRangeChooser( chart, ranges, label )
  {
    var chooser = $( '<div/>' ).addClass( 'chartRangeChooser' );
    var cxt = {};
    
    var layout = {
      type:'selector',
      items:ranges, 
      dataSource: { path:'chartRange' },
      options:{ 
        events:{ 
          selectmenuchange: function(context, event) { 
            chart.defaultFocusRange = ranges.chartRange;
            setFocusRange( chart, ranges.chartRange );
          }
        } 
      } 
    };
    
    if( label )
      layout.label = label;
                    
    widget.layout( chooser, layout, undefined, [chart,ranges] );
    
    return chooser;
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
      showFocus: false,
      xFormat: 'date',
      yFormat: 'default'
    }, options );
  
    var height = $.isNumeric(options.height) ? options.height+'px' : options.height;
    var width = $.isNumeric(options.width) ? options.width+'px' : options.width;

    var chartPromise = $.Deferred();
    nv.addGraph( function() {
      
      var chart = nv.models.lineChart()
        .id( 'line-chart' )
        .margin({
          left: options.leftMargin,
          right: options.rightMargin,
          bottom: 30
        })
        .focusHeight( 55 )
        .focusMargin({ bottom: 25 })
        .useInteractiveGuideline( (options.interactive=='guideline')?true:false )
        .showLegend( options.showLegend?true:false )
        .focusEnable( options.showFocus?true:false )
        .showYAxis( options.showYAxis?true:false )
        .showXAxis( options.showXAxis?true:false )
        .interactive( (options.interactive=='hover')?true:false )
        .duration(0)
      ;

      
      var dataProjection = [];
      var i=0;
      $.each( options.data, function( key, dataHolder ) {
        if( $.isArray( dataHolder ) || $.isFunction( dataHolder ) )
        {
          var datum = {
            key: widget.util.expandPath( '_{'+ key.replace(/\./g, "_") +'}' ),
            values: factory.attachDataManager( dataHolder, chart ),
          };
          if( dataHolder.disabled !== undefined )
            datum.disabled = dataHolder.disabled;
          dataProjection.push( datum );
        }
      });
      
      chart.dataProjection = dataProjection;
      chart.yTickFormat( getFormatter( options.yFormat ) );

      var xFormat = getFormatter( options.xFormat );
      var getAxisFormatter = function( axis ) {
        return function( data, tick, series ) {
          return xFormat( data, tick, series, axis );
        };
      };

      chart.tooltip.headerFormatter( xFormat );
      chart.interactiveLayer.tooltip.headerFormatter( xFormat );
      chart.xAxis.tickFormat( getAxisFormatter( chart.xAxis ) );      
      chart.x2Axis.tickFormat( getAxisFormatter( chart.x2Axis ) );      


      if( options.title )
        $( '<div/>', {html:  widget.util.expandPath( options.title )} ).addClass( 'chartTitle' ).prependTo( options.parent );

      var defaultRangeApplied = false;
      chart.defaultFocusRange = options.defaultFocusRange;

      var rangeChooser = null;
      if( options.ranges )
      {
        rangeChooser = createRangeChooser( chart, options.ranges, options.focusRangeLabel );
        $( rangeChooser ).appendTo( options.parent );
        
        chart.dispatch.on( 'brush', function brushListener( event ) {
          var currentRange = +$('select', rangeChooser).val();
          var dx = event.extent[1] - event.extent[0];
          var domain = chart.x2Axis.domain();
          
          if( currentRange && (dx != currentRange) )
          {
            delete chart.defaultFocusRange;
            options.ranges.chartRange = options.ranges[0].key;
            $('.widget-select', rangeChooser).trigger('widget-update');
          }
        });
      }
      
      d3.select( domSelector )
        .style( {width:width, height:height} )
        .datum( dataProjection )
        .call( chart )
      ;
      
      function updateWithDefaultFocusRange() {
        if( chart.defaultFocusRange )
        {
          var domain = chart.x2Axis.domain();
          var dx = (domain[1] - domain[0]);
          
          if( defaultRangeApplied && dx < chart.defaultFocusRange )
          {
            // Chart lost data and now we're under the default range - reset.
            defaultRangeApplied = false;
            setFocusRange( chart, 0 );
          }  
          else if( !defaultRangeApplied && dx > chart.defaultFocusRange )
          {
            // Chart gained data and we're over the default range, so apply the 
            // default and update the range chooser
            defaultRangeApplied = true;
            setFocusRange( chart, chart.defaultFocusRange, options.ranges );
            if( options.ranges )
            {
              options.ranges.chartRange = chart.defaultFocusRange;
              $('.widget-select', rangeChooser).trigger('widget-update');
            }
          }
          else if( defaultRangeApplied )
          {
            setFocusRange( chart, chart.defaultFocusRange );
          }
          else
          {
            chart.update();
          }
        }
        else
          chart.update();
      }
      
      chart.refreshData = updateWithDefaultFocusRange;

      updateWithDefaultFocusRange();

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