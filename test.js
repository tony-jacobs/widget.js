var progressNow = 0;
function setProgress( msg, pct, force ) {
  var seconds = Math.floor( (new Date().getTime()) / 1000 );
  if( seconds > progressNow )
  {
    progressNow = seconds;
    if( pct !== undefined )
    {
      msg += " (" + pct + "%)";
    }

    //$('.statusFeedbackPane').empty().text( msg );
    console.log( "STATUS " + msg );
  }
  else if( force )
    console.log( "STATUS " + msg );
}


(function(){

  var mainNav = {
    selector: '#tabNav',
    defaultSelection:0,
    tabClass:'widgetTabPanel',
    labelSelector:['#appIconMenu','#appMobileMenu'],
    labelClass:'iconMenuLabel',
    selectedClass:'tabSelected',
    tabData: [
      { name:'Demo', label:'Demo', type:'Tab', layout:{
        "type": "list",
        "content": [
          {
            "type": "label",
            "name": "Widget.js demo App",
            "options": {
              "styleClass": "panelTitle"
            }
          },
          {
            "type": "namedPanel",
            "name": "Grid Layout",
            "content": {
              "type": "list",
              "dataSource": {
                "type": "data",
                "path": "testList"
              }
            },
            "options": {
              defaultRenderer: 'itemCard',
              "sort": "newest",
              "hideOnEmpty": true
            }
          },
          {
            "type": "namedPanel",
            "name": "Table Layout",
            "content": {
              "type": "list",
              "dataSource": {
                "type": "data",
                "path": "testList"
              }
            },
            "options": {
              defaultRenderer: 'tableRowRenderer'
            }
          },
          {
            "type": "chart",
            "chartType":"donut",
            "dataSeries":"charts",
            "options": {
            }
          },
          {
            "type": "chart",
            "chartType":"bar",
            "dataSeries":"charts",
            "options": {
            }
          }
        ]
      } },
      { name:'Search', label:'Search', type:'Tab', layout:
        {
          "type":"list",
          "content":[
            {
              "type":"label",
              "name":"Search",
              "options":{
                "styleClass":"searchTitle"
              }
            },
            {
              "type":"label",
              "name":"Search results will display here.",
              "options":{
                "styleClass":"searchCopy"
              }
            }
          ]
        }
      }
    ]
  };

  widget.util.setData( 'actionManager', {
    sampleAction: {
      enabled: true,
      action: function() { 
        console.log( "Do something here" );
      }
    }
  });
  
  widget.util.setData( 'renderers', {
    tableRowRenderer: {
      type: "renderer",
      options: {
        styleClass: "tableRow"
      },
      layout: {
        "type": "list",
        "content": [
          {
            "type": "label",
            "name": "${meta,0.rendererKey|??}",
            "options": {
              "styleClass": "index"
            }
          },
          {
            "type": "label",
            "name": "${title}",
            "options": {
              "styleClass": "title"
            }
          },
          {
            "type": "label",
            "name": "={ return moment( data.post_date*1000 ).format('MMM. DD YYYY, h:mm A'); }",
            "options": {
              "styleClass": "postDate"
            }
          },
          {
            "type": "label",
            "name": "${excerpt}",
            "options": {
              "styleClass": "excerpt"
            }
          },
          {
            "type": "chart",
            "chartType": "sparkline",
            'dataSeries': "charts.${dataSeries}",
            "options": {
              width: 150,
              height: 24
            }
          },
          {
            "type": "chart",
            "chartType": "gauge",
            'dataSeries': "charts.${dataSeries}",
            "options": {
              height: 40
            }
          },
          {
            "type": "chart",
            "chartType": "readout",
            'dataSeries': "charts.${dataSeries}",
            "options": {
              "formatter": "percent"
            }
          }
        ]
      }
    },
    itemCard: {
      type: "renderer",
      options: {
        styleClass: "cardContent"
      },
      layout: {
        "type": "list",
        "content": [
          {
            "type": "label",
            "name": "${title}",
            "options": {
              "styleClass": "title"
            }
          },
          {
            "type": "label",
            "name": "={ return moment( data.post_date*1000 ).format('MMM. DD YYYY'); }",
            "options": {
              "styleClass": "datestamp"
            }
          },{
            "type": "label",
            "name": "={ return moment( data.post_date*1000 ).format('h:mmA'); }",
            "options": {
              "styleClass": "timestamp"
            }
          },
          {
            "type": "label",
            "name": "${excerpt}",
            "options": {
              "styleClass": "summary"
            }
          }
        ]
      }
    }
  });

  function createActionEnabler( actionKey ) {
    return function actionEnabler( object, path ) {
      var mgr = widget.util.get( 'actionManager', actionKey );
      if( !mgr.dirty )
        mgr.dirty = {};
      mgr.dirty[ path ] = true;
      widget.util.set( 'actionManager', actionKey+".enabled", true );
    };
  }
  //widget.util.watch( 'context','alert', createActionEnabler( 'sampleAction' ) );

  var launch = function launch() {
    startDataManager(
      function onLoad( data, isChanged ) {
        createScreen( mainNav );
      },
      function onUpdate( data, changeSet ) {
        if( changeSet )
          console.log( "Refreshed data (" + JSON.stringify(changeSet) + ")" );
      }
    );
  };

  launch();
})();


function keyFactory( obj ) {
  if( obj.key )
    return obj.key;
  else
    return obj.type+obj.id;
}

function startDataManager( onReady, onUpdate ) {

  var data = {
    testList: {
      type:"list",
      content:[
        {
          "id":"1",
          "type":"alert",
          "lastModified":1423853991,
          "title":"Test Item 1",
          "excerpt":"Lorem ipsum dolor amit",
          "content":"Lorem ipsum dolor amit sit quo nullam eadem longus textus",
          "post_date":1395420888,
          "dataSeries": "series1"
        },
        {
          "id":"2",
          "type":"alert",
          "lastModified":1423853991,
          "title":"Test Item 2",
          "excerpt":"Lorem ipsum dolor amit",
          "content":"Lorem ipsum dolor amit sit quo nullam eadem longus textus",
          "post_date":1422970265,
          "keywords":"",
          "dataSeries": "series2"
        },
        {
          "id":"3",
          "type":"alert",
          "lastModified":1423853991,
          "title":"Test Item 3",
          "excerpt":"Lorem ipsum dolor amit",
          "content":"Lorem ipsum dolor amit sit quo nullam eadem longus textus",
          "post_date":1395420882,
          "dataSeries": "series3"
        },
        {
          "id":"4",
          "type":"alert",
          "lastModified":1423853991,
          "title":"Test Item 4",
          "excerpt":"Lorem ipsum dolor amit",
          "content":"Lorem ipsum dolor amit sit quo nullam eadem longus textus",
          "post_date":1422970264,
          "keywords":"",
          "dataSeries": "series4"
        }
      ]
    }
  };
  
  $.each( data, function( key, value ) {
    $.each( value.content, function( key, value ) {
      value.id = keyFactory( value );
      value.action = ( value.url ) ? createUrlViewAction( value ) : createArticleViewAction( value );
      Search.appendRecord( value.id, value );
    });
  });
  
  data.charts = generateSampleData();
  
  onReady( widget.util.setData( 'data', data ), true );
}

function createUrlViewAction( data )
{
  return function urlViewAction() {
    showIframePopup( $('#tabNav').parent(), data.url );
  };
}

function createArticleViewAction( data )
{
  var articleContent = "";
  if( data.content )
    articleContent += data.content;
  if( data.metaContent )
    articleContent += data.metaContent;

  if( !articleContent )
    articleContent = "<i>This message has no content</i>";

  return function articleViewAction() {
    var content = $( '<div/>' ).addClass( 'contentView' );
    var header = $( '<div/>' ).addClass( 'contentViewHeader' ).appendTo( content );


    $( '<div/>', { text: data.title } ).addClass( 'title' ).appendTo( header );

    var byline = $( '<div/>' ).addClass( 'contentViewByline' ).appendTo( content );
    var pubTime = moment( (data.post_date || data.lastModified) * 1000 );
    byline.append( $('<div/>', {text: pubTime.format('MMM. DD YYYY') } ).addClass('datestamp') );
    byline.append( $('<div/>', {text: pubTime.format('h:mmA') } ).addClass('timestamp') );

    var body = $( '<div/>', {html:articleContent} ).addClass( 'contentViewBody' ).appendTo( content );
    $( 'a', body ).each( function( i, anchor ){
      anchor = $(anchor);
      var href = anchor.attr( 'href' );
      if( href )
      {
        if( href.startsWith( '#' ) )
        {
          anchor.on( 'click', function() {
            var targetAnchor = $( "a[name=" + href.substring(1) + "]" );
            body.animate({
              scrollTop: targetAnchor.offset().top
            }, 400);
            return false;
          });
        }
        else
        {
          anchor.on( 'click', function() {
            window.open( href, 'widgetLinkViewer' );
            return false;
          } );
        }
      }
    });
    showContentPopup( $('#tabNav').parent(), content );

    $('.'+data.key).toggleClass( 'unread', false );
  };
}

function generateSampleData() 
{
  function sine() {
    var sin = [];
    var now =+new Date();
    for (var i = 0; i < 10; i++) {
      sin.push({
        x: now - (10-i) * 1000, 
        y: 50+100*Math.sin(i)
      });
    }
    return sin;
  }
  
  function createUpdater( seriesKey )
  {
    return function dataSeriesUpdater() {
      data[seriesKey].push( {
        x: new Date(),
        y: Math.random() * 100
      });
    };
  }

  var vals = [ 30, 200, 100, 400, 150, 250 ];

  var data = {
    series1: widget.chartFactory.createDataSource( sine() ),
    series2: widget.chartFactory.createDataSource( [] ),
    series3: widget.chartFactory.createDataSource( [] ),
    series4: widget.chartFactory.createDataSource( sine() ),
  };

  var now = new Date();
  var len = vals.length;
  vals.forEach( function( val, index ) {
    data.series2.push( {
      x: now-(len-index)*1000, 
      y: val
    });
    data.series3.push( {
      x: now-(len-index)*1000, 
      y: val
    });
  });
  
  Object.keys( data ).forEach( function( seriesKey ) {
    var updater = createUpdater( seriesKey );
    var timeout = 500 + Math.random()*750;
    setInterval( updater, timeout );
  });  

  return data;
}



