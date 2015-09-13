
widget.ChartFactory = (function() {
  
  var chartId = 0;
  var charts = {};
  var chartRegistry = {};
  
  function ChartFactory() {
    var factory = this;
    
    factory.charts = charts;
    factory.chartRegistry = chartRegistry;
  }
  
  ChartFactory.prototype.create = function create( options )
  {
    var factory = chartRegistry[ options.type ];
    if( factory )
      return factory( this, options );
    else
      return $(options.parent).append( $( "<div/>", {text:options.type} ).addClass( "chart error " + options.type ) );
  };


  ChartFactory.prototype.createChartNode = function createChartNode( options, classKey, nodeType )
  {
    var containerId = 'chart-' + (chartId++);
    var className = 'chart';
    if( options.chartStyleClass )
      className += ' ' + options.chartStyleClass;
    if( classKey )
      className += ' ' + classKey;

    var node = (nodeType == 'svg') ? document.createElementNS( 'http://www.w3.org/2000/svg', 'svg' ) : document.createElement( nodeType );
  
    node.setAttribute( 'id', containerId );
    node.setAttribute( 'class', className );
    $( options.parent ).append( node );
    
    return containerId;
  };

  ChartFactory.prototype.attachDataSource = function attachDataSource( data, domSelector, chartId, maxValues )
  {
    var dataSet = data;
    maxValues = maxValues || 60;
    
    if( typeof data == 'function' )
    {
      dataSet = data().slice( 0 );
      var end = dataSet.length;

      data.subscribe( function( oldData ) {
        var newData = data();
        if( newData.length > end )
        {
          var append = newData.slice( end );
          end = newData.length;
          for( var i=0; i<append.length; i++ )
          {
            while( dataSet.length >= maxValues )
              dataSet.shift();
            dataSet.push( append[i] );
          }
        }
        
        if( domSelector )
          d3.select( domSelector ).call( charts[ chartId ] );
      });
    }
    
    return dataSet;
  };
  
  ChartFactory.prototype.createDataSource = function createDataSource( initalValues, changeListener )
  {
    var self = ko.observableArray( initalValues||[] );
    self._subscriptions = [];
    
    if( changeListener )
      self._subscriptions.push( self.subscribe( changeListener ) );
    
    return self;
  };
  
  ChartFactory.registerChart = function registerChart( chartName, chartCreator )
  {
    chartRegistry[ chartName ] = chartCreator;
  };
  
  return ChartFactory;
})();
widget.chartFactory = new widget.ChartFactory();

