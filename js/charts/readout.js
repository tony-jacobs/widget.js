(function readoutDisplay(){

  widget.ChartFactory.registerChart( 'readout', createReadout );


  function htmlUnit( dataType, value, unit )
  {
    var typeClass = "formatValue" + dataType.charAt(0).toUpperCase() + dataType.slice(1);
    var formattedString = "<span class='formatValue "+typeClass+"'><span class='value'>" + value + "</span><span class='unit'>" + unit + "</span></span>";
    return formattedString;
  }

  var formatters = {
    percent: function format( value, html ) {
      return html ? htmlUnit( 'percent', (value).toFixed(1), "%" ) : (value).toFixed(1) + "%";
    }
  };

  function createReadout( factory, options ) {
    var data = options.data;
    var format = options.formatter;
    if( !$.isFunction(format) )
    {
      var formatKey = format;
      format = function( val ) {
        return formatters[formatKey]( val, true );
      };
    }

    var chartId = factory.createChartNode( options, 'readout', 'div' );
    var domSelector = '#'+chartId;
    var chart = $( domSelector, $(options.parent) )[0];

    chart.updateReadout = function updateReadout( oldValue ) {
      if( dataSet )
      {
        var val = dataSet[ dataSet.length-1 ];
        var formatString = format( val.y );

        chart.innerHTML = formatString;
      }
      else
        chart.innerHTML = "data error";
    };

    var dataSet = data;
    if( typeof data == 'function' )
    {
      data.subscribe( chart.updateReadout );
      dataSet = data();
    }

    factory.charts[ chartId ] = chart;
    chart.updateReadout();
    var chartPromise = $.Deferred();
    chart.domSelector = domSelector;
    chartPromise.resolve( chart );
    return chartPromise;
  }

})();
