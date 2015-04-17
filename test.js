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
    },
    popupRenderer: {
      type: "renderer",
      options: {
        styleClass: "popupContent"
      },
      layout: {
        "type": "list",
        "content": [
          {
            "type": "list",
            "content": [
              {
                "type": "label",
                "name": "${title}",
                "options": {
                  "styleClass": "title"
                }
              }
            ],
            options: { 
              styleClass: 'popupHeader' 
            }
          },
          {
            "type": "list",
            "content": [
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
                "type": "chart",
                "chartType": "interactiveSparkline",
                'dataSeries': "charts.${dataSeries}",
                "options": {
                }
              },
              {
                "type": "content",
                "name": "${content}",
                "options": {
                  "styleClass": "summary"
                }
              }
            ],
            options: { 
              styleClass: 'popupBody' 
            }
          },

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
          "excerpt":"Bacon ipsum",
          "content":"<h2>A brief discourse on bacon</h2><p>Contents: <a href='http://leverege.com'>Link</a> <a href='#para1'>1</a> <a href='#para2'>2</a> <a href='#para3'>3</a> <a href='#para4'>4</a> <a href='#para5'>5</a></p>"+
                    "<a name='para1'></a><p>Bacon ipsum dolor amet pork chicken biltong leberkas tongue ground round. Pig jerky ham strip steak brisket. Landjaeger venison pork chop bacon cupim beef, pork prosciutto chicken chuck short ribs andouille ham hock sausage brisket. Porchetta andouille rump sirloin tail. Brisket ham t-bone tenderloin cupim. Ham beef ribs filet mignon shoulder alcatra turducken shankle prosciutto brisket andouille tongue cupim bacon picanha jerky.</p>"+
                    "<a name='para2'></a><p>Jowl swine chicken tenderloin flank alcatra, shankle filet mignon. Flank jerky pork, shank shoulder boudin cupim shankle. Filet mignon ham hock short ribs, jerky pastrami shank pig beef ribs picanha ball tip turducken ground round boudin tongue. Jerky venison spare ribs prosciutto landjaeger salami. Tenderloin pig shankle pork belly. Pork chop ham hock swine ham t-bone, alcatra biltong.</p>"+
                    "<a name='para3'></a><p>Andouille pork loin sirloin bacon spare ribs strip steak short ribs beef ribs tri-tip sausage meatball. Andouille chuck shank cupim shankle alcatra sausage jerky corned beef spare ribs venison fatback picanha short ribs. Turducken strip steak cupim ham pork belly pork leberkas. Tail pork chop capicola leberkas t-bone short ribs beef filet mignon. Swine landjaeger salami beef chuck, turducken bacon tongue pork belly beef ribs cupim. Boudin cupim alcatra ground round ham, tri-tip picanha venison landjaeger swine beef ribs shankle cow filet mignon doner.</p>"+
                    "<a name='para4'></a><p>Shankle corned beef pork, t-bone doner short ribs ball tip sirloin boudin. Swine kielbasa brisket t-bone rump. Jowl picanha tail alcatra porchetta meatloaf. Chicken alcatra capicola porchetta.</p>"+
                    "<a name='para5'></a><p>Shoulder spare ribs sirloin t-bone kielbasa bresaola jowl porchetta rump andouille tongue ham hock ball tip swine. Fatback cow meatball, flank swine drumstick short loin biltong leberkas corned beef rump tenderloin pork jerky pork belly. Pork meatball kevin, ribeye spare ribs picanha doner cow shankle boudin. Pork loin pancetta doner chuck leberkas, shankle landjaeger boudin andouille pig hamburger ball tip ground round jowl. Alcatra tail turkey pig fatback filet mignon porchetta rump pork boudin beef salami capicola shoulder. Sirloin chuck rump, ham hock chicken flank pancetta pastrami kielbasa pig andouille cow. Landjaeger strip steak jerky turducken, andouille ribeye shank bresaola.</p>",
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
      value.action = ( value.url ) ? widget.ui.createUrlViewAction( value ) : widget.ui.createRendererPopupAction( value, 'popupRenderer' );
      Search.appendRecord( value.id, value );
    });
  });
  
  data.charts = generateSampleData();
  
  onReady( widget.util.setData( 'data', data ), true );
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



