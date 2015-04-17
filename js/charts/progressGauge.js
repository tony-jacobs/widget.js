(function progressGaugeDisplay(){
  
  widget.ChartFactory.registerChart( 'progressGauge', createProgressGauge );


  function createProgressGauge( factory, options ) {
    
    options = $.extend( {}, options||{}, {
      color: '#1d5d79',
      fillColor: '#e0e0e0',
      
      lineWidth: 0.12
    });
    
    var opts = {
      angle: 0.5,
      lineWidth: options.lineWidth,
      pointer: {
        length: 0.66, 
        strokeWidth: 0.035
      },
  
      colorStart: options.color,
      colorStop: options.color,
      strokeColor: options.fillColor
    };
    
    var width, height;
    if( options.width )
    {
      width = options.width;
      height = options.height || width;
    }
    else
    {
      height = options.height || 100;
      width = options.width || height;
    }
    
    var chartId = factory.createChartNode( options.parent, 'progressGauge', 'canvas' );
    var domSelector = '#'+chartId;
    var chart = $( domSelector, $(options.parent) )[0];
    var gauge = new Donut( chart );
    
    gauge.canvas.width = width;
    gauge.canvas.height = height;
      
    gauge.setOptions( opts ); 
    gauge.minValue = options.minValue || 0;
    gauge.maxValue = options.maxValue || 100;
    gauge.animationSpeed = 5;
  
    var dataSet = options.data;
    
    chart.updateGauge = function updateGauge( oldValue ) {
      var val = dataSet[ dataSet.length-1 ].y;
      
      if( val < gauge.minValue )
        val = gauge.minValue;
  
      if( val > gauge.maxValue )
        val = gauge.maxValue;
      gauge.set( val );
    };
    
    if( typeof dataSet == 'function' )
    {
      dataSet.subscribe( chart.updateGauge );
      dataSet = dataSet();
    }
  
    factory.charts[ chartId ] = gauge;
    $(chart).css( {width:width+'px', height:height+'px'} );
    chart.updateGauge();

    return gauge;
  }

})();