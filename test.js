(function(){
  var unitTest = false;

widget.util.set( 'nest', 'test', [ {name:'foo'} ] );
widget.util.set( 'renderers', 'parentRenderer', {
  type: 'renderer',
  layout: { type:'list', dataSource: { type:'nest', path:'test' }, options:{ defaultRenderer:'childRenderer' } }
});
widget.util.set( 'renderers', 'childRenderer', {
  type: 'renderer',
  layout: { type:'label', name: '${name}' }
});

  var mainNav = {

    type: 'tabGroup',
    options: {
      defaultSelection: 0,
      tabClass: 'widgetTabPanel',
      labelSelector:['#appIconMenu','#appMobileMenu'],
      labelClass:'iconMenuLabel',
      selectedClass:'tabSelected',
      tabPath: 'main'
    },
    content: [
      { name:'Demo', label:'Demo', type:'Tab', layout:{
        type: "list",
        hide: true,
        content: [
          {
            type: "label",
            name: "Widget.js demo App",
            options: {
              styleClass: "panelTitle",
              events: {
                ready: function( context, event ) { console.log( context.data.name, "Ready!", context, event ); },
                mouseenter: function( context, event ) { console.log( context.data.name, "Rollover!", context, event ); },
                mouseleave: function( context, event ) { console.log( context.data.name, "Roll Off!", context, event ); },
                click: function( context, event ) { console.log( context.data.name, "Click!", context, event ); }
              }
            }
          },
          {
            type: "list",
            dataSource: {
              type: "data",
              path: "testList"
            },
            options: {
              defaultRenderer: 'itemCard'
            }
          },
          {
            type: "namedPanel",
            name: "Empty Layout",
            content: {
              type: "list",
              dataSource: {
                type: "data",
                path: "empty"
              }
            },
            options: {
              defaultRenderer: 'itemGridCell',
              events: {
                update: function( context, event ) {
                  $( context.view ).toggle( widget.util.get( 'data', 'empty' )().length > 0 );
                }
              }
            }
          },

          {
            type: "namedPanel",
            name: "Grid Layout",
            content: {
              type: "list",
              dataSource: {
                type: "data",
                path: "koList"
              }
            },
            options: {
              defaultRenderer: 'itemGridCell'
            }
          },

          {
            type: "namedPanel",
            name: "Table Layout",
            content: {
              type: "list",
              dataSource: {
                type: "data",
                path: "testList"
              }
            },
            options: {
              sort: "newest",
              defaultRenderer: 'tableRowRenderer'
            }
          },

          {
            type: 'tabGroup',
            content: [
              {
                type:'Tab',
                name: 'all',
                label:'Selectors',
                layout: {
                  type:'list',
                  content: [
                    {type:'label', name:'Selector test' },
                    {type:'selector', name:'Selector', items:['one', 'two', 'three'], dataSource:{ type:'test',path:'select1'}, options:{ events:{
                      load: function(){ widget.util.set('test','select1','three'); },
                      fieldChange: function(context, event) { console.log( "change", context, event ); }
                    } } },
                    {type:'combobox', items:['one', 'two', 'three'], dataSource:{ type:'test',path:'select2'}, options:{ events:{
                      load: function(){ widget.util.set('test','select2','three'); },
                      fieldChange: function(context, event) { console.error( "change", context, event ); }
                    } } },
                    {type:'selector', name:'Selector', label: 'withLabel', items:['one', 'two', 'three'], options: { events: {
                      fieldChange: function(context, event) { console.log( "change", context, event ); }
                    } } },
                    {type:'combobox', label: 'Editable with label:', placeholder:'myPlaceholder', items:['one', 'two', 'three'], options:{ events:{
                      fieldChange: function(context, event) { console.log( "change", context, event ); }
                    } } },
                  ]
                }
              },
              { type:'Tab', name: 'a', label:'Renderer', layout: { type:'renderer', dynamicRenderer:'simpleRenderer' } },
              { type:'Tab', name: 'b', label:'Sliders', layout: { type:'list', content: [
                {type:'label', name:'Slider test' },
                {type:'slider', dataSource: { type:'test', path:'slider1' }, options: { events: {
                  change: function( context, event ) {
                    console.log( "Slider1 change::", widget.util.get( 'test', 'slider1' ) );
                  }
                } } },
                { type:'slider', label: 'slider2', dataSource: { type:'test', path:'slider2' }, options: { readout:true, events: {
                  fieldChange: function( context, event ) {
                    console.log( "Slider2 delta::", widget.util.get( 'test', 'slider2' ) );
                  }
                } } },
                { type:'slider', dataSource: { type:'test', path:'slider3' }, options: {
                  minValue: 0,
                  maxValue: 1,
                  stepSize: 0.05,
                  readout:true,
                  events: {
                    fieldChange: function( context, event ) {
                      console.log( "Slider3 delta::", widget.util.get( 'test', 'slider3' ) );
                    }
                  }
                } }
              ] } },
              { type:'Tab', name: 'c', label:'Section C', layout: { type:'label', name:'content for C' } },
            ],
            options: {
              labelHolder: 'sectionLabels'
            }
          },
          /*
          {
            "type": "namedPanel",
            "name": "Charts",
            "content": {
              type: "list",
              content: [
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
                },
                {
                  "type": "chart",
                  "chartType":"pie",
                  "dataSeries":"charts",
                  "options": {
                  }
                },
                {
                  "type": "chart",
                  "chartType":"graph",
                  "dataSeries":"charts",
                  "options": {
                  }
                },
                {
                  "type": "chart",
                  "chartType":"horizontalBar",
                  "dataSeries":"charts",
                  "options": {
                  }
                },
                {
                  "type": "chart",
                  "chartType":"line",
                  "dataSeries":"charts",
                  "options": {
                  }
                }
              ],
              options: { styleClass: 'chartPanel', expandable:true }
            }
          },
          */
        ]
      } },
      { name:'Tests', label:'Tests', type:'Tab', layout:
        {
          "type":"list",
          "content":[

            { type:'renderer', dynamicRenderer:'parentRenderer' },
            { type:'list', dataSource: { type:'nest', path:'test' }, options:{ defaultRenderer:'childRenderer' } },

            {
              type:'list',
              content:[
                {
                  type:'table',
                  columns: [
                    { name: 'Off', data:'${off|0}' },
                    { name: 'On', data:'${on|0}' },
                    { name: 'Total', data:'${total|0}' },
                  ],
                  dataSource: {
                    type: 'count',
                    path: 'entityCounts'
                  }
                },
                {
                  type:'table',
                  columns: [
                    { name: 'Value', data:'${value}' }
                  ],
                  dataSource: {
                    type: 'random',
                    path: 'numbers'
                  },
                  contentOptions: {
                    sortBy: function( a, b ) {
                      return b.value - a.value;
                    }
                  }
                },
                {
                  type:'inputField',
                  label:'Name',
                  dataSource: { type:'entity', path:'name' },
                  options: {
                    events: {
                      enter: function( a, b, c ) {
                        console.log( "Enter", a, b, c );
                      }
                    }
                  }
                },
                {
                  type:'inputField',
                  label:'Name2',
                  options: { autoHide: true },
                  dataSource: { type:'entity', path:'name2' }
                },
                {
                  type:'checkBox',
                  label:'LED 1',
                  options: { autoHide: true },
                  dataSource: { type:'entity', path:'led1' }
                },
                {
                  type:'checkBox',
                  label:'LED 2',
                  options: { autoHide: true },
                  dataSource: { type:'entity', path:'led2' }
                },
                {
                  type:'checkBox',
                  label:'LED 3',
                  options: { autoHide: true },
                  dataSource: { type:'entity', path:'led3' }
                },
                {
                  type:'checkBox',
                  label:'LED 4',
                  options: { autoHide: true },
                  dataSource: { type:'entity', path:'led4' }
                },
                {
                  type:'checkBox',
                  label:'LED 5',
                  options: { autoHide: false },
                  dataSource: { type:'entity', path:'led5' }
                },
                {
                  type:'selector',
                  label:'Buzzer 1',
                  options: { autoHide: true },
                  items: [ "Off", "Short", "Long", "Pulse" ],
                  dataSource: { type:'entity', path:'buzz' }
                },
                {
                  type:'selector',
                  options: { autoHide: true },
                  items: [ "Off", "Short", "Long", "Pulse" ],
                  dataSource: { type:'entity', path:'buzz' }
                },
                {
                  type:'selector',
                  label:'Buzzer 2',
                  options: { autoHide: true },
                  items: [ "Off", "Short", "Long", "Pulse" ],
                  dataSource: { type:'entity', path:'buzz2' }
                },
                {
                  type:'selector',
                  label:'Buzzer 3',
                  options: { autoHide: true },
                  items: [ "Off", "Short", "Long", "Pulse" ],
                  dataSource: { type:'entity', path:'buzz3' }
                },
                {
                  type:'list',
                  options:{ styleClass:'buttonBar' },
                  content: [
                    {
                      type:'button',
                      name:'Cancel',
                      action:'dismissNameEditor'
                    },
                    {
                      type:'button',
                      name:'Save',
                      action:'saveNameEditor'
                    }
                  ]
                }
              ]
            }
          ]
        }
      },
      { name:'ChartDemo', label:'Chart Demo', type:'Tab', layout:
        {
          type:"list",
          options: {
            events: {
              dataReady: function onDataReady() {

                var series = {
                  testList: {
                    type:"list",
                    content:[
                      { title:"Item 1", dataSeries: "demoChart.s1" },
                      { title:"Item 2", dataSeries: "demoChart.s2" },
                      { title:"Item 3", dataSeries: "demoChart.s3" },
                      { title:"Item 4", dataSeries: "demoChart.s4" }
                    ]
                  }
                };

                function createUpdater( seriesKey )
                {
                  console.log( seriesKey );
                  return function dataSeriesUpdater() {
                    widget.util.get( 'data', seriesKey ).push( {
                      x: new Date(),
                      y: Math.random() * 100
                    });
                  };
                }

                var now = Date.now();
                for( var i in series.testList.content )
                {
                  var o = series.testList.content[i];
                  var s = widget.chartFactory.createDataSource( [] );

                  for( var j=50; j>=0; j-- )
                  {
                    s.push( {
                      x: now-(j*1000),
                      y: Math.floor( Math.random() * 100 )
                    });
                  }

                  var key = o.dataSeries;
                  widget.util.set( 'data', key, s );
                  var updater = createUpdater( key );
                  var timeout = 500 + Math.random()*750;
                  //o._interval = setInterval( updater, timeout );
                }

                widget.util.setData( 'demo', series );
              }
            }
          },
          content:[
            {
              type: "list",
              dataSource: {
                type: "demo",
                path: "testList"
              },
              options: {
                defaultRenderer: 'demoItemCard'
              }
            },
            {
              type: "namedPanel",
              name: "Charts",
              content: {
                type: "list",
                content: [
                  {
                    type: "chart",
                    chartType:"donut",
                    dataSeries:"demoChart",
                    options: {}
                  },
                  {
                    type: "chart",
                    chartType:"bar",
                    dataSeries:"demoChart",
                    options: {}
                  },
                  {
                    type: "chart",
                    chartType:"pie",
                    dataSeries:"demoChart",
                    options: {}
                  },
                  {
                    type: "chart",
                    chartType:"graph",
                    dataSeries:"demoChart",
                    options: {}
                  },
                  {
                    type: "chart",
                    chartType:"horizontalBar",
                    dataSeries:"demoChart",
                    options: {}
                  },
                  {
                    type: "chart",
                    chartType:"line",
                    dataSeries:"demoChart",
                    options: {
                      showFocus: true,
                      defaultFocusRange: 5000,
                      focusRangeLabel: 'Time interval',
                      ranges: [
                        {key:0,displayName:'manual'},
                        {key:5000,displayName:'5s'},
                        {key:10000,displayName:'10s'},
                        {key:25000,displayName:'25s'},
                        {key:40000,displayName:'40s'},
                        {key:2*60*1000,displayName:'2 min'}
                      ]
                    }
                  },
                  {
                    type: "chart",
                    chartType:"line",
                    dataSeries:"demoChart",
                    options: {
                      events: {
                        rollover: function onRollover( options, series ) {
                          var rollover = [];

                          for( var i in series )
                            rollover.push( series[i] );
                          console.log( "rollover", options, series, JSON.stringify( rollover ) );
                        }
                      }
                    }
                  }
                ],
                options: { styleClass: 'chartPanel', expandable:true }
              }
            }
          ]
        }
      },
      {
        name:'Preload', label:'Preload', type:'Tab', layout: {
          type:"list",
          preload: [
            'test.css'
          ],
          content:[
            { type:'label', name:'preload', options:{ styleClass:'hotdogStand' } }
          ]
        }
      },
      {
        name:'Chat', label:'Chat', type:'Tab', layout: {
          type:"list",
          content:[
            { type:'label', name:'chat' },
            {
              type:'list',
              dataSource: { type:'chat', path:'messages' },
              options:{
                defaultRenderer:'chatMessage',
                events: {
                  load: function onLoad( context, event ) {
                    var data = {
                      "foo":"bar",
                      "baz":"fun"
                    };

                    widget.util.set( context.layout.dataSource.type, context.layout.dataSource.path, data );
                    console.log( data, widget.util.get( 'chat', 'messages') );
                  },
                  ready: function onReady( context, event ) {
                    widget.util.set( context.layout.dataSource.type, '_'+context.layout.dataSource.path, context.layout.content );
                  }
                }
              }
            },
            {
              type:'list',
              content: [
                {
                  type:'inputField',
                  dataSource: { type:'chat', path:'post'},
                  options: {
                    events: {
                      fieldChange: function( a, b ) {
                        console.log( "Field Change", a,b );
                      },
                      change: function( a, b ) {
                        console.log( "Change", a,b );
                      },
                      enter: function( context, event ) {
                        $( '.postButton', $(context.view).parent() ).trigger( 'click' );
                      }
                    }
                  }
                },
                {
                  type:'label',
                  name:'postMessage',
                  options: {
                    styleClass: 'postButton',
                    events: {
                      click: function onClick( context, event ) {
                        var ds = widget.util.get( 'chat', 'messages' );
                        var key = Date.now();
                        ds[ key ] = widget.util.get( 'chat', 'post' );
                        var f = widget.util.get( 'chat', '_messages.onKeyAdded' );
                        if( $.isFunction( f ) )
                          f( key );
                      }
                    }
                  }
                },
              ]
            }
          ]
        }
      }
    ]

  };

  widget.util.set( 'renderers', 'chatMessage', {
    type: "renderer",
    options: {
    },
    layout: {
      type: 'list',
      content: [
        { type:'label', name:'Key: ${key}' },
        { type:'label', name:'Value: ${value}', options:{unselectable:false} },
      ]
    }
  });

  widget.util.setData( 'actionManager', {
    sampleAction: {
      enabled: true,
      action: function() {
        console.log( "Do something here" );
      }
    }
  });

  widget.util.set( 'renderers', 'tableRowRenderer', {
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
            "name": "-=${title}=-",
            "options": {
              "styleClass": "title"
            }
          },
          {
            "type": "label",
            "name": "_{test} ${title} _{xx${title}xx}",
            "options": {
              "styleClass": "title"
            }
          },
          {
            "type": "label",
            "name": "TIME: ={ return moment( data.post_date*1000 ).format('MMM. DD YYYY, h:mm A'); }",
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
          // {
          //   "type": "chart",
          //   "chartType": "progressGauge",
          //   'dataSeries': "charts.${dataSeries}",
          //   "options": {
          //     height: 40
          //   }
          // },
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
    });

    widget.util.set( 'renderers', 'demoItemCard', {
      type: "renderer",
      options: {
        styleClass: "cardContent"
      },
      layout: {
        type: "list",
        content: [
          {
            type:"list",
            content:[
              {
                type: "chart",
                chartType: "gauge",
                dataSeries: "${dataSeries}",
                options: {
                  width: 150
                }
              },
              {
                type: "chart",
                chartType: "readout",
                dataSeries: "${dataSeries}",
                options: {
                  formatter: "percent"
                }
              },
              {
                type: "chart",
                chartType: "sparkline",
                dataSeries: "${dataSeries}",
                options: {
                  width: 138,
                  height: 24
                }
              }
            ],
            options: {
              styleClass: "content"
            }
          },
          {
            type: "label",
            name: "${title}",
            options: {
              styleClass: "title"
            }
          }
        ]
      }
    });

    widget.util.set( 'renderers', 'itemCard', {
      type: "renderer",
      options: {
        styleClass: "cardContent"
      },
      layout: {
        "type": "list",
        "content": [
          {
            "type":"list",
            "content":[
              {
                "type": "chart",
                "chartType": "gauge",
                'dataSeries': "charts.${dataSeries}",
                "options": {
                  width: 150
                }
              },
              {
                "type": "chart",
                "chartType": "readout",
                'dataSeries': "charts.${dataSeries}",
                "options": {
                  "formatter": "percent"
                }
              },
              {
                "type": "chart",
                "chartType": "sparkline",
                'dataSeries': "charts.${dataSeries}",
                "options": {
                  width: 138,
                  height: 24
                }
              }
            ],
            "options": {
              "styleClass": "content"
            }
          },
          {
            "type": "label",
            "name": "${title}",
            "options": {
              "styleClass": "title"
            }
          }
        ]
      }
    });

    widget.util.set( 'renderers', 'itemGridCell', {
      type: "renderer",
      options: {
        styleClass: "cardContent",
        events: {
          click: function( context, event ) { console.log( context.data.title, "Click!", context ); }
        }
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
            "name": "={ return moment( data.post_date ).format('MMM. DD YYYY'); }",
            "options": {
              "styleClass": "datestamp"
            }
          },{
            "type": "label",
            "name": "={ return moment( data.post_date ).format('h:mmA'); }",
            "options": {
              "styleClass": "timestamp"
            }
          }
        ]
      }
    });

    widget.util.set( 'renderers', 'simpleRenderer', {
      type: 'renderer',
      layout: { type:'label', name:'Hello world' }
    });

    widget.util.set( 'renderers', 'popupRenderer', {
      type: "renderer",
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
        widget.layout( '#tabNav', mainNav );
      },
      function onUpdate( data, changeSet ) {
        if( changeSet )
          console.log( "Refreshed data (" + JSON.stringify(changeSet) + ")" );
      }
    );
  };

  widget.util.setData( 'localization', {
    common: {
      test: 'Test'
    },
    en: {
      vvv: 'Vvv'
    }
  });

  launch();

  function test( str ) {
    var c = {
      test: "TEST",
      foo: 'vvv'
    };

    var after = widget.parser.expandPath( str, c );
    console.log( "'" + str + "' --> '" + after + "'" );
  }

  if( unitTest )
  {
    $.each( [
      "test",
      "${test}",
      " $test ",
      " ${test} ",
      " _{test} ",
      " \\{test} ",
      " {test} ",
      " ${foo${bar}} ",
      " ${foo${test}} ",
      "${foo ${bar} }",
      "${foo ${test} }",
      " _{${foo}}",
      " ${foo} _{foo} ",
      " ={return 'bah';} ",
      " ={return '${bah}';} "
    ], function( i, o ) { test( o ); } );
  }
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
  data.koList = ko.observableArray([
    { title: "Observable 1", lastModified: Date.now() },
    { title: "Observable 2", lastModified: Date.now() },
    { title: "Observable 3", lastModified: Date.now() }
  ]);

  data.empty = ko.observableArray();

  widget.util.setData( 'entity', { name:'test', led1:true, led2:undefined, led4:false, buzz:'Short', buzz2: undefined } );
  widget.util.set( 'count', 'entityCounts', [
    {off:0, on:undefined, total:1}
  ]);

  // Tests the list and table sort function
  function addRandomValue() {
    widget.util.get( 'random', 'numbers' ).push( { value: Math.random() } );
  }
  widget.util.set( 'random', 'numbers', new ko.observableArray( [] ) );

  for( var i=0; i<4; i++ )
  {
    addRandomValue();
    setTimeout( addRandomValue, i*150 );
  }


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

  // Object.keys( data ).forEach( function( seriesKey ) {
  //   var updater = createUpdater( seriesKey );
  //   var timeout = 500 + Math.random()*750;
  //   setInterval( updater, timeout );
  // });

  return data;
}
