// Bind an event 'destroyed' to the destruction of a DOM node
(function($){
  $.event.special.destroyed = {
    remove: function(o) { if (o.handler) o.handler(); }
  };
})(jQuery);


var widget = (function(){

  function get( obj, path, defaultValue )
  {
    $.each( path.split('.'), function(i,key) {
      return obj ? ( obj = obj[ key ] ) : false;
    });

    return (obj===undefined || obj ===null) ? defaultValue : obj;
  }

  function set( obj, path, newValue )
  {
    var keys = path.split('.');
    $.each( keys, function(i,key) {
      if( i == (keys.length-1) )
      {
        oldValue = obj[ key ];
        obj[key] = newValue;
        return false;
      }
      else
      {
        if( obj[key] === undefined )
        {
          obj[key] = {};
        }
        obj = obj[key];
      }
    });

    return oldValue;
  }

  function attachEvents( item, eventMap, context )
  {
    if( item && eventMap )
      $.each( eventMap, function( event, handler ) {
        $(item).on( event, null, context, handler );
      } );
  }

  function formatSize( bytes, decimalFix, si )
  {
    var thresh;
    var units;
    if( si === undefined )
    {
      thresh = 1024;
      units = ['k','M','G','T','P','E','Z','Y'];
    }
    else
    {
      thresh = (si ? 1000 : 1024);
      units = si ? ['kB','MB','GB','TB','PB','EB','ZB','YB'] : ['KiB','MiB','GiB','TiB','PiB','EiB','ZiB','YiB'];
    }

    if(bytes < thresh) return bytes + ' B';
    var u = -1;
    do {
      bytes /= thresh;
      ++u;
    } while(bytes >= thresh);
    return bytes.toFixed( decimalFix||1 )+' '+units[u];
  }

  function printCompressionStats( startTime, message, s1, s2 )
  {
    var ms = (Date.now()-startTime);
    if( ms > 10 )
    {
      var pct = ( 100 * s1/s2 ).toFixed( 2 );
      console.log( message + " " + formatSize( s1*2, 2 ) + " --> " + formatSize( s2*2, 2 ) + " (" + pct + "%) in " + ms + " ms" );
    }
  }

  var self = {
    get: get,
    set: set,
    showPopup: function showPopup( popupFactory, parent, options )
    {
      options = options || {};
      var overlay = $('.popupOverlay');
      var panel = $( "<div/>" ).addClass( 'popupHolder' );
      var contentHolder = $("<div/>").addClass( 'popupContent' ).appendTo( panel );

      panel.actions = {
        show: function() {
          parent.prepend( panel );
          overlay.one( 'click', panel.actions.hide );
          panel.one( 'click', panel.actions.hide );

          // tonyj:  Let the parenting operation complete before CSS transition, so we yield our event loop slot with a setTimeout( xx, 0ms )
          setTimeout( function() {
            panel.addClass( 'popupTransition' );

            if( $.isFunction( options.onReady ) )
              setTimeout( options.onReady, 450 );
          }, 0 );
          return true;
        },
        hide: function() {
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

    generateList: function generateList( selector, dataList, options, itemFactory )
    {
      var view = $( selector );
      itemFactory = itemFactory || function(){ return  $("<div/>", { text:'default item' } ); };

      options = $.extend( {}, options );
      options.itemOptions = $.extend( { itemClass: 'listItem' }, options.itemOptions );

      $.each( dataList, function( i, data ) {
        var item = itemFactory( data, options.itemOptions );
        view.append( item );
        attachEvents( item, options.itemOptions.events, { source:item, data:data } );
      });

      return view;
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
    },

    getStorage: function getStorage( preferLocal )
    {
      var flavor = preferLocal ? 'local' : 'sync';
      var chromeStorage =  (window.chrome && chrome.storage && chrome.storage[flavor]);
      var decodeStorage = function decodeStorage( encoded, isCompressed, dataName ) {
        var obj = null;
        if( encoded )
        {
          if( isCompressed )
          {
            var now = Date.now();
            var oldLen = encoded.length;
            encoded = LZString.decompressFromUTF16( encoded );
            var ms = (Date.now()-now);
            if( ms > 10 )
            {
              var pct = Math.floor(10000*encoded.length/oldLen)/100;
              printCompressionStats( now, dataName + " Decompress", oldLen, encoded.length );
            }
          }
          obj = JSON.parse( encoded );
        }
        return obj;
      };
      var encodeStorage = function encodeStorage( obj, willCompress, dataName ) {
        var encoded = "";
        if( obj )
        {
          encoded = JSON.stringify( obj );
          if( willCompress )
          {
            var now = Date.now();
            var oldLen = encoded.length;
            encoded = LZString.compressToUTF16( encoded );
            printCompressionStats( now, dataName + " Compress", oldLen, encoded.length );
          }
        }
        return encoded;
      };

      if( chromeStorage )
        return {
          get: function( key, callback, useCompression ) {
            chrome.storage[flavor].get( key, function( obj ) {
              callback( decodeStorage( obj[ key ], useCompression, key ) );
            } );
          },
          set: function( key, value, useCompression ) {
            chrome.storage[flavor].set( { key: encodeStorage( value, useCompression, key ) } );
          }
        };
      else
        return {
          get: function( key, callback, useCompression ) {
            // Yield the thread to prevent synchronous processing
            setTimeout( function() {
              var data = window.localStorage[ key ];
              callback( decodeStorage( data, useCompression, key ) );
            }, 0 );
          },
          set: function( key, value, useCompression ) {
            window.localStorage.setItem( key, encodeStorage( value, useCompression, key ) );
          }
        };
    },

    createText: function createText( options )
    {
      var textWidget = {
        options: options,
        createView: function() {
          var view = $('<div/>', {text:options.text});
          if( options.class )
            view.addClass( options.class );
          if( options.id )
            view.attr( 'id', options.id );
          if( $.isFunction( options.action ) )
            view.click( options.action );

          return (textWidget.view = view);
        },
        getView: function() {
          if( !textWidget.view )
            textWidget.view = textWidget.createView();
          return textWidget.view;
        }
      };
      return textWidget;
    },

    createButton: function createButton( options )
    {
      if( !options.action ) options.action = function() { console.log( options.key + " clicked" ); };

      var button = {
        options: options,
        createView: function() {
          var view = $('<img/>', {src:options.icon});
          view.addClass( options.key+"Button operationButton" );
          if( options.id )
            view.attr( 'id', options.id );
          view.click( options.action );

          return (button.view = view);
        },
        getView: function() {
          if( !button.view )
            button.view = button.createView();
          return button.view;
        }
      };
      return button;
    },

    createToggleButton: function createToggleButton( options )
    {
      if( !options.action ) options.action = function( state ) { console.log( options.key + " clicked", state ); };

      var button = {
        options: options,
        toggleState: (options.initialState || false),

        toggle: function() {
          var newState = !button.toggleState;
          button.options.action( newState );
          button.toggleState = newState;
          button.view.attr( 'src', button.getIcon() );
        },
        getIcon: function() {
          var stateKey = button.toggleState ? "iconOn" : "iconOff";
          return button.options[ stateKey ] || button.options.icon;
        },
        createView: function() {
          var view = $('<img/>', {src: button.getIcon() });
          view.addClass( options.key+"Button operationButton" );
          if( options.id )
            view.attr( 'id', options.id );
          view.click( button.toggle );

          return (button.view = view);
        },
        getView: function() {
          if( !button.view )
            button.view = button.createView();
          return button.view;
        }
      };
      return button;
    },

    getAncestorData: function getAncestorData( cxt, key, defaultValue )
    {
      if( !cxt )
        return defaultValue;

      var data = $(cxt).data();

      if( data && data[key] )
        return data[key];
      else
        return self.getAncestorData( $(cxt).parent(), key, defaultValue );
    },

    makeAutorefresh: function makeAutorefresh( view, update, refreshInterval, initialize  )
    {
      var refreshTimeout = null;
      refreshInterval = refreshInterval || 2000;

      if( $.isFunction( update ) )
      {
        var updater = function() {
          var shouldCancel = update( view );
          if( !shouldCancel && refreshTimeout )
            refreshTimeout = setTimeout( updater, refreshInterval );
        };
        refreshTimeout = setTimeout( updater, refreshInterval );
      }

      view.on( 'destroyed', function() {
        if( refreshTimeout )
        {
          clearTimeout( refreshTimeout );
          refreshTimeout = null;
        }
      });

      if( initialize && $.isFunction( update ) )
        update( view );

      return view;
    },

    showMessage: function showMessage( msg, options )
    {
      var slideDuration = 350;
      var messageView = null;
      options = $.extend( { messageType: 'info' }, (options || {}) );
      var type = options.messageType;

      var lastTimer = self._messageTimer || options.timer;
      if( lastTimer )
      {
        clearTimeout( lastTimer );
        delete options.timer;
        delete self._messageTimer;
      }

      var holder = $('.statusHolder');
      if( msg )
      {
        messageView = $( '<div/>', { text:msg } );
        messageView.options = options;

        $( '.statusMessage', holder ).empty().removeClass().addClass( 'statusMessage '+type ).append( messageView );
        holder.animate( { height:30 }, {
          duration: slideDuration,
          step:options.step
        } );

        lastTimer = null;
        if( options.timeout ){
          lastTimer = setTimeout( showMessage, options.timeout, "", { step: options.step } );
          self._messageTimer = lastTimer;
        }

        var clickHandler = options.click || function() {
          showMessage("", { timer: lastTimer, step: options.step });
        };
        messageView.click( clickHandler );

        if( options.audio ) new Audio( options.audio ).play();

        $('#statusBackground').removeClass().addClass( type+"Background" );
      }
      else
      {
        holder.animate( { height:0 }, {
          duration: slideDuration,
          easing: 'swing',
          complete:function() {
            $( '.statusMessage', holder ).empty();
            $('#statusBackground').removeClass();
          },
          step: options.step
        } );
      }
      return messageView;
    },

    symbol: function symbol( fontAwesomeKey, additionalClasses ) {
      var v = $( '<i/>' ).addClass( 'fa fa-' + fontAwesomeKey );
      if( additionalClasses )
        v.addClass( additionalClasses );

      return v;
    },

    symbolButton: function symbolButton( fontAwesomeKey ) {
      var v = $('<span/>').addClass( 'fa-stack fa-lg' );
      v.append( widget.symbol( 'square-o', 'fa-stack-2x' ) );
      v.append( widget.symbol( fontAwesomeKey, 'fa-stack-1x' ) );
      return v;
    }
  };

  return self;
})();

