
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
  },
  
  showPopup: function showPopup( popupFactory, parent, options )
  {
    parent = $(parent);
    options = options || {};
    var overlay = $('.popupOverlay');
    var panel = $( "<div/>" ).addClass( 'popupHolder' );
    var contentHolder = $("<div/>").addClass( 'popupContent' ).appendTo( panel );

    panel.actions = {
      show: function() {
        parent.prepend( panel );
        parent.toggleClass( 'widget-popup-active', true );
        overlay.one( 'click', panel.actions.hide );
        panel.one( 'click', panel.actions.hide );

        // tonyj:  Let the parenting operation complete before CSS transition, so we yield our event loop slot with a setTimeout( xx, 0ms )
        setTimeout( function() {
          panel.addClass( 'popupTransition' );

          if( $.isFunction( options.onReady ) )
            setTimeout( options.onReady, 450 );
        }, 0 );
        return panel;
      },
      hide: function() {
        parent.toggleClass( 'widget-popup-active', false );
        panel.removeClass( 'popupTransition' );
        overlay.off( 'click', panel.actions.hide );
        panel.one("webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend", function() {
          panel.remove();
          if( $.isFunction( options.onDismiss ) )
            options.onDismiss();
       });
       return false;
      }
    };

    contentHolder.append( popupFactory( panel, contentHolder ) );

    return panel.actions.show();
  },
  
  generateTabs: function generateTabs( selector, options )
  {
    options = $.extend( {
      defaultSelection: 0,
      selectedClass: "tabSelected",
      labelSelector: ".labels",
      labelClass: "tabLabel",
      tabClass: "tab",
      tabTypes: ['Tab','HiddenTab'],
      selector: selector
    }, options );

    if( ! $.isArray( options.labelSelector ) )
      options.labelSelector = [ options.labelSelector ];

    var view = $( options.selector );
    var tabIndex = 0;

    var tabManager = {
      type: 'tabManager',
      options: options,
      nextTab: function() {
        var next = $( '.'+options.selectedClass, view ).next( '.'+options.tabClass );
        return tabManager.performSelection( next );
      },
      previousTab: function() {
        var prev = $( '.'+options.selectedClass, view ).prev( '.'+options.tabClass );
        return tabManager.performSelection( prev );
      },
      selectTab: function( tabName ) {
        var tab = tabManager.getTab(tabName);
        if( tab && (tabName != tabManager.currentTabName() ) ) {
          tabManager.performSelection( tab, null );
        }
      },
      getTab: function( tabName ) {
        var tab = null;
        view.children( '.'+options.tabClass ).each( function() {
          var tabView = $(this);
          if( tabView.data( 'name' ) == tabName )
            tab = tabView;
        } );
        return tab;
      },
      currentTabName: function() {
        var tab = $( '.'+options.tabClass+"."+options.selectedClass, view );
        return tab ? tab.data( 'name' ) : null;
      },
      performSelection: function( tab ) {
        if( tab && tab.length )
        {
          view.children( '.'+options.tabClass ).each( function() { $(this).removeClass( options.selectedClass ).css( {display:'none'} ); } );
          tab.addClass( options.selectedClass ).css( {display:'inline-block'} );
          tab.children().trigger( 'tabselected' );

          tabLabel = tab.data( 'tabLabelView' );
          $.each( options.labelSelector, function( i, labelSelector ) {
            var tabBarHolder = $( labelSelector, view );
            tabBarHolder.children( '.'+options.labelClass ).each( function() { $(this).removeClass(options.selectedClass); } );
          });

          if( tabLabel )
          {
            $.each( tabLabel, function() {
              $(this).addClass( options.selectedClass );
            } );
          }

          $.each( options.labelSelector, function( i, labelSelector ) {
            var tabBarHolder = $( labelSelector, view );
            tabBarHolder.children( '.'+options.labelClass ).each( function() {
              var view = $(this);
              var iconKey = view.hasClass(options.selectedClass) ? 'icon_on' : 'icon_off';

              $( '.iconHolder', view ).attr( 'src', view.data( iconKey ) || view.data('icon') );
            } );
          });

          if( $.isFunction( tabManager.onTabChanged ) )
            tabManager.onTabChanged( tab.data( 'name'), tab, tabManager );

          return tab;
        }
        else
          return false;
      },
      view: view
    };

    var createTabLabelView = function( o, tabIndex ) {
      var tabLabel;
      if( o.type == 'Tab' )
      {
        var iconKey = ( tabIndex === options.defaultSelection ) ? 'icon_on' : 'icon_off';
        var tabIcon = o[ iconKey ] || o.icon;
        tabLabel = $("<div/>").addClass( 'clickable unselectable ' + options.labelClass).addClass(options.labelClass+o.name).click( function() {
          tabManager.performSelection( o.view );
        });
        var label = o.label || o.name;
        tabLabel.append( $("<div/>").append( tabIcon ? $("<img/>", {src:tabIcon} ).addClass('iconHolder') : $("<div/>", { text: label } ) ) );
        tabLabel.data( o );

        if( tabIndex === options.defaultSelection )
          tabLabel.addClass( options.selectedClass );
      }
      return tabLabel;
    };

    var tabData = options.tabData;

    if( !tabData )
    {
      tabData = [];
      view.children().each( function( i, o ) {
        var tab = $(o);
        if( tab.data('type') )
        {
          tabData.push( $.extend( {}, tab.data(), {
            view: tab
          } ) );
        }
      } );
    }

    $.each( tabData, function( i, o ) {
      var tab = o.view;
      var dataType = o.type;

      if( !tab ) {
        tab = $('<div/>').appendTo( view );
        o.view = tab;
      }

      if( options.tabTypes.indexOf( dataType ) > -1 )
      {
        tab.data( 'tabIndex', tabIndex );
        tab.data( 'name', o.name );
        tab.css( {display: tabIndex === options.defaultSelection ? 'inline-block':'none' } );
        tab.data( 'tabManager', tabManager );
        tab.addClass( options.tabClass );
        tab.addClass( options.tabClass + o.name );
        if( tabIndex === options.defaultSelection )
        {
          tab.addClass( options.selectedClass );
          window.setTimeout( function deferredSelectionEvent() {
            tab.children().trigger( 'tabselected' );
          }, 0 );
        }

        $.each( options.labelSelector, function( i, labelSelector ) {
          var tabBarHolder = $( labelSelector, view );
          var tabLabel = createTabLabelView( o, tabIndex );
          if( tabLabel )
          {
            tabBarHolder.append( tabLabel );
            var labelViews = tab.data( 'tabLabelView' ) || [];
            labelViews.push( tabLabel );
            tab.data( 'tabLabelView', labelViews );
          }
        });

        tabIndex++;
      }
    });

    view.data( 'tabManager', tabManager );
    return view;
  }
};

function showIframePopup( parent, url ) {
  return widget.ui.showPopup( function( panel, contentHolder ) {
    contentHolder.addClass( 'iframePopup' );
    contentHolder.html("<iframe width='600' height='600' frameborder='0' scrolling='true' marginheight='0' marginwidth='0' src='"+url+"'></iframe>");
    contentHolder.css("display","block");
  }, parent );
}

function showContentPopup( parent, content ) {
  return widget.ui.showPopup( function( panel, contentHolder ) {
    contentHolder.addClass( 'contentPopup' ).append( $( content ).css("display","block") );
  }, parent );
}


function createScreen( options )
{
  var screen = $( options.selector );

  var tabNav = widget.ui.generateTabs( screen, options );
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


