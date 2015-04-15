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
              "styleClass": "demoTitle"
            }
          },
          {
            "type": "namedPanel",
            "name": "Alerts",
            "content": {
              "type": "list",
              "dataSource": {
                "type": "context",
                "path": "alert"
              }
            },
            "options": {
              "sort": "newest",
              "hideOnEmpty": true
            }
          },
          {
            "type": "namedPanel",
            "name": "News",
            "content": {
              "type": "list",
              "dataSource": {
                "type": "context",
                "path": "news"
              }
            },
            "options": {
              "sort": "newest",
              "hideOnEmpty": true
            }
          }
        ]
      } },
      // { name:'Tools', type:'Tab' },
      
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
      },
      // { name:'Feedback', type:'Tab' },
      // { name:'CustomerEducation', type:'Tab' },
      // { name:'About', type:'Tab' },
      // { name:'Profile', type:'Tab' },
      // { name:'Authentication', type:'HiddenTab' },
      // { name:'Search', type:'HiddenTab' }
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

  var context = {
      "alert":{
        "type":"list",
        "content":[
          {
            "id":"2126",
            "type":"alert",
            "lastModified":1423853991,
            "title":"Test Item",
            "excerpt":"Lorem ipsum dolor amit",
            "content":"Lorem ipsum dolor amit sit quo nullam eadem longus textus",
            "post_date":1395420888,
            "rendererKey":"alertItem"
          },
          {
            "id":"8057",
            "type":"alert",
            "lastModified":1423853991,
            "title":"Test Item 2",
            "excerpt":"Lorem ipsum dolor amit",
            "content":"Lorem ipsum dolor amit sit quo nullam eadem longus textus",
            "post_date":1422970265,
            "keywords":"",
            "rendererKey":"alertItem"
          }
        ]
      }
    };
    
    $.each( context.alert.content, function( key, value ) {
      console.log( "Initialize", key, value );
      value.id = keyFactory( value );
      
      value.action = ( value.url ) ? createUrlViewAction( value ) : createArticleViewAction( value );
      Search.appendRecord( value.id, value );
    });
    
    widget.util.setData( 'context', context );
  
  
  onReady( {}, true );
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

    var iconSource = widget.assets.get( 'icon', data.type, 'img/logo_128.png' );
    $( '<img/>', { src: iconSource } ).addClass('logo').appendTo( header );
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

