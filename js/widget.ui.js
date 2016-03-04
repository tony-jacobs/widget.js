
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

    panel.on('closePopup', panel.actions.hide );
    contentHolder.append( popupFactory( panel, contentHolder ) );

    return panel.actions.show();
  },

  generateTabs: function generateTabs( selector, options, stack )
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
      eventBus: $('<div/>'),
      options: options,
      nextTab: function() {
        var next = $( '.'+options.selectedClass, view ).next( '.'+options.tabClass );
        return tabManager.performSelection( next );
      },
      previousTab: function() {
        var prev = $( '.'+options.selectedClass, view ).prev( '.'+options.tabClass );
        return tabManager.performSelection( prev );
      },
      selectTab: function( tabName, suppressEvents ) {
        var tab = tabManager.getTab(tabName);
        if( tab && (tabName != tabManager.currentTabName() ) ) {
          tabManager.performSelection( tab, suppressEvents );
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
      getTabWidget: function( tabView ) {
        tabView = $( tabView || tabManager.currentTab() )[0];
        for( var i in options.tabData||[] )
        {
          var tab = options.tabData[i];
          if( tab.view[0] == tabView )
            return tab;
        }
      },
      currentTab: function() {
        return view.find( '> .'+options.tabClass+"."+options.selectedClass );
      },
      currentTabName: function() {
        var tab = tabManager.currentTab();
        return tab ? tab.data( 'name' ) : null;
      },
      performSelection: function( tab, suppressEvents ) {

        if( tab && tab.length && (tabManager.currentTabName() != tab.data('name')) )
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

          if( !suppressEvents )
            tabManager.eventBus.trigger( 'tabChanged', tab );

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
        tabLabel = $("<div/>").addClass( 'clickable unselectable ' + options.labelClass).addClass(options.labelClass+o.name).click( function() {
          tabManager.performSelection( o.view );
        });

        if( "object" == $.type( o.label ) )
        {
          widget.layout( tabLabel, o.label, undefined, stack );
        }
        else
        {
          var iconKey = ( tabIndex === options.defaultSelection ) ? 'icon_on' : 'icon_off';
          var tabIcon = o[ iconKey ] || o.icon;
          var label = o.label || o.name;
          tabLabel.append( $("<div/>").append( tabIcon ? $("<img/>", {src:tabIcon} ).addClass('iconHolder') : $("<div/>", { text: label } ) ) );
        }
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
            tabManager.eventBus.trigger( 'defaultTabSelected', tab );
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

(function tabMixinClosure(){
  var tabManagers = {};
  var historyListener = null;
  var urlKey = 'tab';


  widget.eventBus.on( 'ready.start', function( context, event ){
    if( event.tabManager )
      urlKey = event.tabManager.urlKey;
  });

  widget.ui.setTabManager = function setTabManager( manager, path ) {
    if( !path )
      path = 'main';
    else if( !path.startsWith('main') )
      path = 'main.'+path;

    tabManagers[ path ] = manager;

    if( !historyListener )
    {
      historyListener = function( event, context ) {
        if( context[ urlKey ] )
          widget.ui.selectTab( context[ urlKey ], true );
        else
          console.log( "IGNORE history event", context );
      };
      widget.eventBus.on( 'history', historyListener );
    }

    manager.eventBus.on( 'tabChanged', function() {
      widget.history.pushHistory( urlKey, widget.ui.getTabPath() );
    });
  };

  widget.ui.selectTab = function selectTab( path, silenceEvents ) {
    var leaf;
    var elements = path ? path.split('.') : [];
    if( elements[0] != 'main' )
      elements.unshift('main');

    var mgrKey = '';
    for( var i=0; i<(elements.length-1); i++ )
    {
      mgrKey = mgrKey + elements[i];
      if( tabManagers[ mgrKey ] )
      {
        leaf = tabManagers[ mgrKey ].selectTab( elements[i+1], silenceEvents );
        mgrKey += '.';
      }
      else
      {
        throw "Tab group '" + mgrKey + "' not found";
      }
    }
    return leaf;
  };

  widget.ui.getTabPath = function getTabPath( prefix ) {
    if( !prefix )
    {
      return widget.ui.getTabPath( 'main' );
    }
    else if( tabManagers[ prefix ] )
    {
      var name = tabManagers[ prefix ].currentTabName();
      return name ? widget.ui.getTabPath( prefix+'.'+name ) : prefix;
    }
    return prefix;
  };
})();
