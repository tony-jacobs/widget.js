(function gaugeDisplay(){
  
  widget.ChartFactory.registerChart( 'gauge', createGauge );


  function createGauge( factory, options ) {
    var opts = {
      angle: 0.15,
      lineWidth: 0.50,
      pointer: {
        length: 0.66, 
        strokeWidth: 0.035
      },
  
      strokeColor: options.fillColor || '#E0E0E0',
      percentColors: [
        [ 0.0, "#a9d70b" ],
        [ 0.6, "#a9d70b" ],
        [ 0.75, "#f9c802" ],
        [ 1.0, "#ff0000" ]
      ]
    };
    
    var width, height;
    if( options.width )
    {
      width = options.width;
      height = options.height || width * 0.667;
    }
    else
    {
      height = options.height || 100;
      width = options.width || height * 1.5;
    }
    
    var chartId = factory.createChartNode( options.parent, 'gauge', 'canvas' );
    var domSelector = '#'+chartId;
    var chart = $( domSelector, $(options.parent) )[0];
    var gauge = new Gauge( chart );
    
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