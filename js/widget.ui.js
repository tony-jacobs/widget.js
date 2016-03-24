(function uiClosure(){

  widget.ui = {

    showRendererPopup: function showRendererPopup( renderer, data, parent )
    {
      parent = parent || $('body');
      var content = $('<div/>');

      var layout = {
        type: 'renderer'
      };
      if( $.type( renderer ) === 'string' )
        layout.dynamicRenderer = renderer;
      else // renderer is an object
        layout.staticRenderer = renderer;

      var options = {};

      widget.layout( content, layout, options, [ data ] );
      return widget.ui.showPopup( function( panel, contentHolder ) {
        contentHolder.addClass( 'contentPopup' ).append( $( content ).css("display","block") );
      }, parent );
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
        _fireSelection: function( tab, suppressEvents ) {
          if( tabManager.onTabChanged )
            log.error( "onTabChanged() is no longer supported in favor of tabManager.eventBus.on('tabChanged')" );

          if( !suppressEvents )
            tabManager.eventBus.trigger( 'tabChanged', tab );
        },
        performSelection: function( tab, suppressEvents ) {
          if( tab && tab.length && (tabManager.currentTabName() != tab.data('name')) )
          {
            var tabData = tab.data();
            var oldIndex = -1;
            var newIndex = tabData.tabIndex;

            view.children( '.'+options.tabClass ).each( function() {
              var $this = $(this);
              if( $this.hasClass( options.selectedClass ) )
              {
                var oldTab = $this.data();
                oldIndex = oldTab.tabIndex;

                if( !suppressEvents )
                {
                  tabManager.eventBus.trigger( 'tabWillChange', {
                    oldTab: oldTab,
                    newTab: tab.data(),
                    manager: tabManager
                  } );
                }

                var animationClass = (oldIndex<newIndex) ? options.animationHideNext : options.animationHidePrev;
                if( !suppressEvents && animationClass )
                {
                  $this.removeClass( options.selectedClass );
                  widget.ui.animate( $this, animationClass, function(){
                    $this.hide();
                  } );
                }
                else
                {
                  $this.removeClass( options.selectedClass ).css( {display:'none'} );
                }
              }
            } );

            var animationClass = (oldIndex>newIndex) ? options.animationShowNext : options.animationShowPrev;
            if( !suppressEvents && animationClass )
            {
              widget.ui.animate( tab, animationClass, function(){
                tab.addClass( options.selectedClass );
                setTimeout( function(){
                  tabManager._fireSelection( tab, suppressEvents );
                }, 10 );
              } );
              tab.css( {display:'inline-block'} );
            }
            else
            {
              tab.addClass( options.selectedClass ).css( {display:'inline-block'} );
              tabManager._fireSelection( tab, suppressEvents );
            }

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
        o.tabIndex = i;

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

})();

(function animationMixinClosure(){

  var animationEventKey = (function whichAnimationEvent(){
    var t, el = document.createElement("fakeelement");

    var animations = {
      "animation"      : "animationend",
      "OAnimation"     : "oAnimationEnd",
      "MozAnimation"   : "animationend",
      "WebkitAnimation": "webkitAnimationEnd"
    };

    for (t in animations){
      if (el.style[t] !== undefined){
        return animations[t];
      }
    }
  })();

  widget.ui.animate = function animate( parent, animationClass, callback ) {

    var $parent = $( parent );
    $parent.one( animationEventKey, function onAnimationEnd(event) {
      $parent.toggleClass( animationClass, false );

      if( $.isFunction( callback ) )
        callback( parent, animationClass );

    });
    $parent.toggleClass( animationClass, true );
  };
})();

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


// Simplified from https://github.com/dlom/favicon.js (MIT License)
(function faviconMixinClosure( doc ) {

  var head = doc.getElementsByTagName("head")[0];

  var removeExistingFavicons = function() {
    var links = head.getElementsByTagName("link");

    for (var i = 0; i < links.length; i++)
    {
      if (/\bicon\b/i.test(links[i].getAttribute("rel")))
      {
        head.removeChild(links[i]);
      }
    }
  };

  widget.ui.setFavicon = function setFavicon( iconURL, docTitle ) {
    if( docTitle )
    {
      doc.title = docTitle;
    }

    if( iconURL !== "" )
    {
      var newLink = doc.createElement("link");
      newLink.type = "image/x-icon";
      newLink.rel = "icon";
      newLink.href = iconURL;
      removeExistingFavicons();
      head.appendChild(newLink);
    }
  };

})(document);
