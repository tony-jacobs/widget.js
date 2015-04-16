
widget.ChartFactory = (function() {
  
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
  };


  ChartFactory.prototype.createChartNode = function createChartNode( parentSelector, classKey, nodeType )
  {
    var containerId = 'chart-' + Object.keys( charts ).length;
    var className = 'chart';
    if( classKey )
      className += ' ' + classKey;
  
    var parent = document.querySelector( parentSelector );
    var node = (nodeType == 'svg') ? document.createElementNS( 'http://www.w3.org/2000/svg', 'svg' ) : document.createElement( nodeType );
  
    node.setAttribute( 'id', containerId );
    node.setAttribute( 'class', className );
    parent.appendChild( node );
    
    return containerId;
  };

  ChartFactory.prototype.attachDataSource = function attachDataSource( data, domSelector, chartId )
  {
    var dataSet = data;
    if( typeof data == 'function' )
    {
      data.subscribe( function( oldValue ) {
        d3.select( domSelector ).call( charts[ chartId ] );
      });
      dataSet = data();
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
