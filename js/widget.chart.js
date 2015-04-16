(function() {

  var charts = {};
  
  ChartFactory = (function() {
    
    var chartRegistry = {};
    
    function ChartFactory() {
      var factory = this;
      
      chartRegistry = {
        readout: createReadout,
        gauge: createGauge,
        sparkline: createSparkline,
        interactiveSparkline: createInteractiveSparkline,
        donut: createDonut,
        bar: createBarChart
      };
  
      function createSparkline( options ) {
        var data = options.data;
        var parentSelector = options.parent;
        var chartId = factory.createChartNode( parentSelector, 'sparkline', 'svg' );
        
        charts[ chartId ] = nv.addGraph(function() {
          var chart = nv.models.sparkline();
          chart.width( 200 );
          chart.height( 30 );
      
          var domSelector = '#'+chartId;
          var dataSet = factory.attachDataSource( data, domSelector, chartId );  
        
          d3.select( domSelector )
            .datum( dataSet )
            .transition().duration(250)
            .call(chart);
      
          charts[ chartId ] = chart;
          return chart;
        });
      }
      
      function createInteractiveSparkline( options ) {
        var data = options.data;
        var parentSelector = options.parent;
        var chartId = factory.createChartNode( parentSelector, 'interactivesparkline', 'svg' );
      
        charts[ chartId ] = nv.addGraph(function() {
          var chart = nv.models.sparklinePlus();
          
          var domSelector = '#'+chartId;
          var dataSet = factory.attachDataSource( data, domSelector, chartId );  
          
          chart.margin({left: 200});
          chart.x( function(d,i) { 
            return i;
          });
          chart.xTickFormat( function(d) {
            return d3.time.format('%c')(  new Date( dataSet[d].x) );
          });
          
          chart.yTickFormat( function(d) {
            return d.toFixed(2) + "%";
          });
            
          d3.select( domSelector )
            .datum( dataSet )
            .transition().duration(250)
            .call(chart);
      
          charts[ chartId ] = chart;
          return chart;
        });
      }
      
      function createReadout( options ) {
        var data = options.data;
        var parentSelector = options.parent;
        var format = options.formatter || function( val ) { return val; };
        
        var chartId = factory.createChartNode( parentSelector, 'readout', 'div' );
        var domSelector = '#'+chartId;
        var chart = d3.select( domSelector )[0][0];
        
        chart.updateReadout = function updateReadout( oldValue ) {
          var val = dataSet[ dataSet.length-1 ];
          chart.innerHTML = format( val.y );
        };
      
        var dataSet = data;
        if( typeof data == 'function' )
        {
          data.subscribe( chart.updateReadout );
          dataSet = data();
        }
        
        charts[ chartId ] = chart;
        chart.updateReadout();
        return chart;
      }
      
      function createGauge( options ) {
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
      
        var chartId = factory.createChartNode( options.parent, 'gauge', 'canvas' );
        var domSelector = '#'+chartId;
        var chart = d3.select( domSelector )[0][0];
        var gauge = new Gauge( chart );
          
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
      
        charts[ chartId ] = gauge;
        chart.updateGauge();
        return gauge;
      }
      
      function createDonut( options ) {
        
        var chartId = factory.createChartNode( options.parent, 'donut', 'svg' );
        var domSelector = '#'+chartId;

        var height = options.height || 350;
        var width = options.width || 350;
        
        charts[ chartId ] = nv.addGraph( function() {
          
          var dataProjection = [];
          
          $.each( options.dataSeries, function( key, dataHolder ) {
            var dataSet = dataHolder();
            var datum = {
              key: key,
              y: dataSet[ dataSet.length-1 ].y
            };
            
            dataHolder.subscribe( function( oldValue ) {
              datum.y = dataSet[ dataSet.length-1 ].y;
              d3.select( domSelector ).call( charts[ chartId ] );
            });
            
            dataProjection.push( datum );
          });
          
          
          donutChart = nv.models.pieChart();
          donutChart.x( function(d) {
            return d.key; 
          });
          donutChart.y( function(d) { 
            return d.y;
          });
          donutChart.donut(true);
          donutChart.width(width);
          donutChart.height(height);
          donutChart.padAngle( options.padAngle || 0.08 );
          donutChart.cornerRadius( options.cornerRadius || 5 );
          donutChart.id( 'donut-chart' );
            
          if( options.title )
            donutChart.title( options.title );

          donutChart.pie.donutLabelsOutside(true);
          
          d3.select( domSelector )
            .style( {width:width+'px', height:height+'px'} )
            .datum( dataProjection )
            .transition().duration( options.transtitionDuration||600 )
            .call( donutChart );
  
          charts[ chartId ] = donutChart;
          return donutChart;
        });
      }
      
      function createBarChart( options ) {
        
        var chartId = factory.createChartNode( options.parent, 'bar', 'svg' );
        var domSelector = '#'+chartId;

        var height = options.height || 350;
        var width = options.width || 350;
        
        charts[ chartId ] = nv.addGraph( function() {
          
          var dataValues = [];
          var dataProjection = [{
            values: dataValues
          }];
          
          $.each( options.dataSeries, function( key, dataHolder ) {
            var dataSet = dataHolder();
            var datum = {
              key: key,
              y: dataSet[ dataSet.length-1 ].y
            };
            
            dataHolder.subscribe( function( oldValue ) {
              datum.y = dataSet[ dataSet.length-1 ].y;
              d3.select( domSelector ).call( charts[ chartId ] );
            });
            
            dataValues.push( datum );
          });
          
          var barChart = nv.models.discreteBarChart();
          barChart.x(function(d) { 
            return d.key;
          });
          barChart.y(function(d) { 
            return d.y; 
          });

          barChart.staggerLabels( options.staggerLabels );
          barChart.showValues( !options.hideValues );

          barChart.id( 'bar-chart' );
            
          if( options.title )
            barChart.title( options.title );

          d3.select( domSelector )
            .style( {width:width+'px', height:height+'px'} )
            .datum( dataProjection )
            .transition().duration( options.transtitionDuration||600 )
            .call( barChart )
          ;
  
          charts[ chartId ] = barChart;
          return barChart;
        });
      }
    }
    
    ChartFactory.prototype.create = function create( options )
    {
      var factory = chartRegistry[ options.type ];
      if( factory )
        return factory( options );
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
    
    return ChartFactory;
  })();

})();