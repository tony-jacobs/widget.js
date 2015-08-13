
widget.ui = {
  addAnchorSupport: function( body, options ) {
    
    // todo:  This code is buggy - it seems to find the stuff right, but 
    //        scrolling doesn't always work.
    
    options = $.extend( {}, options||{}, {
      scrollAnimationTime: 400,
      linkWindowTitle: 'widgetLinkViewer'
    });
    
    $( 'a', body ).each( function( i, anchor ){
      anchor = $(anchor);
      var href = anchor.attr( 'href' );
      if( href )
      {
        if( href.startsWith( '#' ) )
        {
          anchor.on( 'click', function() {
            var targetAnchor = $( "a[name=" + href.substring(1) + "]", body );
            body.animate({
              scrollTop: targetAnchor.offset().top
            }, options.scrollAnimationTime );
            return false;
          });
        }
        else
        {
          anchor.on( 'click', function() {
            window.open( href, options.linkWindowTitle );
            return false;
          } );
        }
      }
    });
  },
  
  createUrlViewAction: function createUrlViewAction( data, parent ) {
    return function urlViewAction() {
      showIframePopup( parent || $('body'), data.url );
    };
  },

  createRendererPopupAction: function createRendererPopupAction( data, renderer, parent ) {
    var action = function rendererPopupAction() {
      widget.ui.showRendererPopup( renderer, data, parent );
    };
    
    return action;
  },
  
  showRendererPopup: function showRendererPopup( renderer, data, parent )
  {
    var holder = $('<div/>');
    
    var layout = {
      type: 'renderer'
    };
    if( $.type( renderer ) === 'string' )
      layout.dynamicRenderer = renderer;
    else // renderer is an object
      layout.staticRenderer = renderer;

    var options = {};
    
    widget.layout( holder, layout, options, [ data ] );
    return showContentPopup( parent || $('body'), holder );
  }
};

function showIframePopup( parent, url ) {
  return widget.showPopup( function( panel, contentHolder ) {
    contentHolder.addClass( 'iframePopup' );
    contentHolder.html("<iframe width='600' height='600' frameborder='0' scrolling='true' marginheight='0' marginwidth='0' src='"+url+"'></iframe>");
    contentHolder.css("display","block");
  }, parent );
}

function showContentPopup( parent, content ) {
  return widget.showPopup( function( panel, contentHolder ) {
    contentHolder.addClass( 'contentPopup' ).append( $( content ).css("display","block") );
  }, parent );
}


function createScreen( options )
{
  var screen = $( options.selector );

  var tabNav = widget.generateTabs( screen, options );
  var tabManager = tabNav.data('tabManager');

  var hamburger = widget.symbol( 'bars', 'fa-stack-2x' ).addClass('menuButton').prependTo( $('#hamburger') );
  hamburger.click( function() {
    $('#appMobileMenu').slideToggle( 250 );
  });

  var createTabAction = function createTabAction( tabName ) {
    return function() { 
      tabManager.selectTab( tabName ); 
    };
  };

  $.each( options.tabData, function( i, tab ) {
    var holder = $( '.'+options.tabClass+tab.name, screen );
    widget.layout( holder, tab, options );
  });

  var controlPanel = $('#headerControlPanel');

  var searchWidget = $( '<div/>' ).addClass( 'searchWidget' ).appendTo( controlPanel );
  widget.symbol('search').addClass( 'searchIndicator' ).appendTo( searchWidget );
  var searchField = $( '<input>', { placeholder: 'Search' } ).appendTo( searchWidget );
  searchField.on( "focus", createTabAction( 'Search' ) );

  var resultInfo = $( '<div/>' ).addClass( 'searchResultsPane' ).prependTo( $( '.widgetTabPanelSearch .tabContentHolder') );
  var lastSearch = null;
  var doSearch = function doSearch( query )
  {
    var keys = Search.search( query );
    widget.track( {SEARCH:query, SEARCH_MATCHES:keys.length} );
    var result = [];
    var clipped = false;

    $.each( keys, function( i, match ){
      var item = Search.data[ match.ref ];
  
      var searchTypeFilter = options.searchTypeFilter || []; //['news','alert',etc..];
      if( searchTypeFilter && searchTypeFilter.length )
      {
        if( $.inArray( item.type, searchTypeFilter ) > -1 )
          result.push( item );
      }
      else
        result.push( item );
  
      if( result.length >= 20 )
      {
        clipped = true;
        return false;
      }
    });

    var resultStatus = $( '.status', resultInfo );
    if( (result.length === 0) && (resultStatus.length > 0) )
    {
      resultStatus.slideUp( {
        duration: 350,
        complete: function() {
          resultInfo.empty();
        }
      });
    }

    if( result.length )
    {
      var doAnimate = !resultStatus.length;
      if( doAnimate )
        resultStatus = $( '<div/>' ).addClass( 'status' ).toggle(false);

      resultStatus.text( result.length + ( clipped?"+":"" ) + " matches found" );
      if( doAnimate )
        resultStatus.appendTo( resultInfo ).slideDown(350);
    }
    var searchResultFactory = function searchFactory(view, data, options) {
      return widget.layout( view, $.extend( {}, data, {type:'listItem'}), options );
    };

console.log( "Search result:", result );
//    widget.layout( $( '.widgetTabPanelSearch .contentPane').empty(), { content: result }, { itemFactory: searchResultFactory } );
  };

  searchField.on( "propertychange keyup input paste", function( event ) {
    var q = searchField.val();
    if( q != lastSearch )
    {
      lastSearch = q;
      doSearch( q );
    }
  });


  tabManager.onTabChanged = function onTabNavChanged( tabName, tab, tabManager ) {

    $.each( tabManager.options.tabData, function( i, tabSpec ) {
      searchWidget.toggleClass( tabSpec.name, tabSpec.name==tabName );
    });

// TODO - make this abstract
    if( tabName == 'Search' ) {
      searchField.focus();
      searchWidget.toggleClass( 'searchActive', true );
    }
    else
      searchWidget.toggleClass( 'searchActive', false );

    var obj = {};
    obj[ tabName.toUpperCase() ] = 'SELECTED';
    widget.track( obj );

    var labels = $( '.panelLabel' );
    labels.hide();
    $('.'+tabName+'Header' ).show();
    $('#appMobileMenu').slideUp(250);
  };

  var t = tabManager.currentTabName();
  tabManager.onTabChanged( t, tabManager.getTab( t ), tabManager );

  var toggleMenu = function toggleMenu(){
    $('.dropdownContent').slideToggle( 350 );
    $('.dropdownIndicator').toggleClass( 'fa-rotate-180' );
  };

  var notificationWidget = $( '<div/>' ).addClass( 'notificationWidget clickable' ).on( 'click', toggleMenu ).appendTo( controlPanel );
  var dropDown = $( '<div/>' ).addClass( 'dropdownContent' ).toggle( false ).appendTo( controlPanel );

  refreshContextMenu = function refreshContextMenu( notifications ) {
    notificationWidget.empty();
    var unreadCount = Object.keys( notifications ).length;

    $( '<div/>', { text: unreadCount } ).addClass( 'unreadMessageCount' ).appendTo( notificationWidget );
    $( '<div/>', { text: 'Notifications' } ).addClass( 'label' ).appendTo( notificationWidget );
    widget.symbol('caret-down').addClass( 'dropdownIndicator' ).appendTo( notificationWidget );

    var mobileMenu = $('#hamburger');
    $('.unreadMessageCount', mobileMenu).remove();
    mobileMenu.append( $( '<div/>', { text: unreadCount } ).addClass( 'unreadMessageCount' ) );

    $( '.dropdownContent', controlPanel ).empty();
    var menu = [];
    $.each( notifications, function(i,o){
      menu.push(o);
      return menu.length < 4;
    } );

    if( !menu.length )
      menu.push( {title:"No unread alerts" } );

    if( Object.keys(notifications).length > 4 )
      menu.push( {
        title: 'See More',
        action: function(){
          createTabAction( 'AlertNews' )();
          toggleMenu();
        }
      });

//    menu.push( { title: 'Log Out', action:logoutAction } );

    widget.layout( dropDown, { type:'list', content: menu }, { itemFactory: notificationItem } );
  };

}


