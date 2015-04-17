function showIframePopup( parent, url ) {
  widget.showPopup( function( panel, contentHolder ) {
    contentHolder.addClass( 'iframePopup' );
    contentHolder.html("<iframe width='600' height='600' frameborder='0' scrolling='true' marginheight='0' marginwidth='0' src='"+url+"'></iframe>");
    contentHolder.css("display","block");
  }, parent );
}

function showContentPopup( parent, content ) {
  widget.showPopup( function( panel, contentHolder ) {
    contentHolder.addClass( 'contentPopup' ).append( $( content ).css("display","block") );
  }, parent );
}

widget.assets = (function(){
  map = {};

  return {
    map: map,
    get: function get( context, key, defaultValue ) {
      return widget.get( map, context+'.'+key, defaultValue );
    }
  };
})();

widget.layout = (function(){
  
  var assets = widget.assets;

  function createUrlAction( linkUrl, windowMode ) {
    return function() {
      window.open( linkUrl, (windowMode||'_blank') );
    };
  }

  function createCooperativeFrame( parent, url, label ) {
    return function showCooperativeFrame() {
      var animationTime = 250;

      var holder = $( '<div/>' ).addClass( 'cooperativeFrameHolder' );
      var iframe = $( '<iframe/>', {
        scrolling:true,
        marginheight:0,
        marginwidth:0,
        frameBorder: 0,
        width: '100%',
        height: '100%',
        src: url
      } ).addClass( 'cooperativeFrame' ).appendTo( holder );

      var labelHolder = $( '.panelLabel' ).filter( ':visible' );
      label = label || $( '<div/>', { text: 'X'} ).addClass( 'button' );

      labelHolder.addClass( 'clickable' ).on( 'click', function() {
        holder.remove();
        label.hide( 'slide', {direction:'up'}, animationTime, function() {
          label.remove();
          $('#appHeader').toggleClass( 'sublabelActive', false );
        });
        parent.slideDown( animationTime );
      });

      labelHolder.append( label.hide() );
      label.show( 'slide', {direction:'up'}, animationTime );
      $('#appHeader').toggleClass( 'sublabelActive', true );

      parent.slideUp( animationTime, function() {
        holder.appendTo( parent.parent() );
      } );

    };
  }

  function createTab( parent, options, dataReadyCallback ) {
    var labelHolder = $('<div/>' ).addClass( 'panelLabel unselectable' ).addClass( options.name +"Header" );

    var titleBlock = $('<span/>').addClass( 'tabTitle' ).appendTo( labelHolder );
    titleBlock.append( $( '<img/>', { src: options.icon_on || options.icon } ).addClass('icon') );
    titleBlock.append( $( '<div/>', { text: options.label || options.name } ) );
    labelHolder.hide();
    $('#appHeader').append( labelHolder );
    var panel = $('<div/>').addClass( 'tabContentHolder' );

    var contentPane = $( '<div/>' ).addClass( 'contentPane' ).appendTo( panel );
    contentPane.append( $('<div/>', { text: "Loading..."}) );

    widget.util.loadData( options, function( data ) {
      panel.data( data );
      if( $.isFunction( dataReadyCallback ) )
        dataReadyCallback( contentPane, data );
    } );

    return panel;
  }

  function defaultTabView( parent, tabData, options ) {
    var tabView = createTab( parent, tabData, function( contentPane, data, options ) {
      contentPane.empty();

      return dispatch( contentPane, data, options, function( view, data, options ) {
        return view.append( $('<pre/>', { text: JSON.stringify( data ) } ) );
      });
    });
    return tabView;
  }

  function loadDataSource( dataSource, baseContent, options )
  {
    var db = widget.util.getData( dataSource.type, {} );
    var sourceData = widget.get( db, dataSource.path, {} );

    var result = $.extend( {}, (baseContent||{}), sourceData.content );

    if( options.sort )
    {
      result = applySort( options.sort, result );
    }

    return result;
  }
  
  function dispatch( parent, data, options, defaultHandler ) {
    
    function configureRenderer( data, options ) 
    {
      var typeKey = data.rendererKey || data.type;

      if( options && options.defaultRenderer )
      {
        data.rendererKey = 'renderer';
        data.dynamicRenderer = ( options.renderers && options.renderers[ typeKey ] ) ? options.renderers[ typeKey ] : options.defaultRenderer;
      }
      else
        data.rendererKey = typeKey;
    }
    
    options = $.extend( {}, options, data.options||{} );
    var factory = options.factory;
    delete options.factory;

    // Make a clone of data since we're monkeying with it's actual fields below..
    data = $.extend( {}, data );

    if( data.hasOwnProperty( 'dataSource' ) )
    {
      data.content = loadDataSource( data.dataSource, data.content, options );
    }
    
    if( factory || data.hasOwnProperty( 'type' ) )
    {
      configureRenderer( data, options.listOptions );

      var handler = factory || widget.layout[data.rendererKey];
      if( $.isFunction( handler ) )
      {
        return handler( parent, data, options );
      }
    }

    if( $.isFunction( defaultHandler ) )
      return defaultHandler( parent, data, options );
    else
      return parent;
  }

  function getTimestamp( article )
  {
    return article.post_date || article.lastModified;
  }

  var comparators = {
    'oldest' : function oldestComparator( a, b ) {
      return ( getTimestamp(a) - getTimestamp(b) );
    },
    'newest' : function newestComparator( a, b ) {
      return ( getTimestamp(b) - getTimestamp(a) );
    }
  };

  /**
   * Applies the given sort to the data.  If the data if an object, then the
   * keys will be lost in the conversion - the result is a simple
   * (non-associative) array
   **/
  function applySort( sortType, data )
  {
    if( data && $.isFunction( comparators[sortType] ) )
    {
      var a = [];
      for( var i in data ) {
        a.push( data[i] );
      }
      return a.sort( comparators[sortType] );
    }
    else
      return data;
  }

  var self = {
    Tab: defaultTabView,
    HiddenTab: defaultTabView,

    tabGroup: function createTabGroup( view, data, options )
    {
      var labelHolderClass = options.labelHolder || 'labels';
      var tabOptions = $.extend( {}, options, {
        tabData: data.content,
        labelSelector: "." + labelHolderClass
      } );
      view.append( $('<div/>').addClass( labelHolderClass ) );
      var tabNav = widget.generateTabs( view, tabOptions );
      var tabManager = tabNav.data('tabManager');

      $.each( data.content, function( i, tabData ) {
        var tabContent = dispatch( tabData.view, tabData.content, {}, function( view, data, options ) {
          var v = $('<div/>', {text: data} ).appendTo( view );
          v.addClass( options.styleClass||'tabItem' );
          return v;
        });
      } );
    },

    label: function( view, data, options ) {
      var name = widget.util.expandPath( data.name );

      var label = $('<div/>', {html: name} ).addClass( 'dataLabel' ).addClass('unselectable');
      if( options.styleClass )
        label.addClass( options.styleClass );
        
      if( data.action )
      {
        label.addClass( 'clickable' ).click( data.action );
      }
        
      return label.appendTo( view );
    },

    image: function( view, data, options ) {
      var image = $('<img/>', {src: data.url} ).addClass( options.styleClass || 'dataImage' ).addClass('unselectable').appendTo( view );
      return image;
    },

    icon: function iconFactory( view, data, options ) {
      var icon = $('<div/>' ).addClass( options.styleClass || 'dataIconHolder' ).addClass('unselectable').appendTo( view );

      var iconUrl = widget.util.expandPath( data.iconUrl );
      var displayName = widget.util.expandPath( data.name );

      $('<img/>', {src: iconUrl} ).addClass( options.iconStyleClass || 'dataIcon' ).appendTo( icon );
      $('<div/>', {html: displayName} ).addClass( options.labelStyleClass || 'dataLabel' ).appendTo( icon );

      var action = null;

      if( data.linkUrl )
      {
        var linkUrl = widget.util.expandPath( widget.util.expandPath( data.linkUrl ) );
        if( options.mode=='link' )
          action = createUrlAction( linkUrl );
        else if( options.mode=='cooperativeFrame' )
        {
          var label = $( '<div/>' ).addClass( 'toolTitle' );
          $('<img/>', {src: iconUrl} ).addClass( options.iconTitleStyleClass || 'icon titleIcon' ).appendTo( label );
          $('<div/>', {html: displayName} ).addClass( options.labelTitleStyleClass || 'titleLabel' ).appendTo( label );

          var parent = options.parentSelector ? $(options.parentSelector) : view.parent();
          action = createCooperativeFrame( parent, linkUrl, label );
        }
        if( action && options.trackingKey )
        {
          var oldAction = action;
          action = function() {
            var obj = {};
            obj[ options.trackingKey ] = 'SELECTED';
            widget.util.track( obj );
            oldAction();
          };
        }
      }

      if( action )
        icon.addClass( 'clickable' ).on( 'click', action );

      return icon;
    },

    selector: function( view, data, options ) {
      if( !data.items )
      {
        var listDataSource = widget.get( options, 'listDataSource', null );
        if( listDataSource )
        {
          data.items = widget.util.get( listDataSource.type, listDataSource.path );
        }
      }

      if( data.items )
      {
        var selector = $('<select/>', {name: data.name, id: data.name} );

        var sourceData = widget.util.get( data.dataSource.type, data.dataSource.path );

        $.each( data.items, function( i, item ){
          if( $.type( item ) === "string" )
            item = { key:item, name:item, displayName:item };

          var displayName = item.displayName || (item.key + ": " + item.name);
          var opt = $( '<option/>', { value: item.key, html: displayName } ).appendTo( selector );

          if( sourceData && (item.key == sourceData) )
            opt.prop( 'selected', true );
        } );

        selector.addClass( options.styleClass || 'dataSelectLabel' ).addClass('unselectable');
        selector.on( 'selectmenuchange', function( event ){
          widget.util.set( data.dataSource.type, data.dataSource.path, selector.val() );
        });
        var uiMenu = selector.appendTo( view ).selectmenu({
          width: 360,
          icons: { button: "fa fa-caret-down" } });
        return selector;
      }
      else
      {
        console.log( "Omitting selector", data, "No list items found" );
        return null;
      }
    },

    iframe: function( view, data, options ) {

      var frameHolder = $('<div/>').addClass(options.styleClass || 'frameHolder').appendTo( view );
      var iframe = $( '<iframe></iframe>', {
        frameborder:0,
        scrolling:true,
        marginHeight:0,
        marginwidth:0,
        src: data.url
      }).addClass( 'dataFrame' ).appendTo( frameHolder );

      if( options.browserControls )
      {
        iframe.addClass( 'browserControlTarget' );
        var controlHolder = $('<div/>').addClass('controlHolder').appendTo( frameHolder );
        $('<div/>', {text:'<'}).addClass( 'unselectable clickable button browserButton back' ).click( function(){
          iframe[0].contentWindow.history.back();
        }).appendTo( controlHolder );
        $('<div/>', {text:'>'}).addClass( 'unselectable clickable button browserButton next' ).click( function(){
          iframe[0].contentWindow.history.forward();
        }).appendTo( controlHolder );
      }

      return iframe;
    },


    list: function createListView( parent, listData, listOptions ) {
      var panel = $('<div/>' ).addClass( listOptions.styleClass||'listPanel' ).appendTo( parent );
      $.each( ['max-width', 'margin-right'], function( i, key ) {
        if( listOptions[ key ] ) panel.css( key, listOptions[key] );
      });

      $.each( listData.content, function( i, item ) {
        var listItem = dispatch( panel, item, { listOptions: listOptions, factory: listOptions.itemFactory }, function( view, data, options ) {
          var v = $('<div/>', {text: data} ).appendTo( view );
          v.addClass( options.styleClass||'listItem' );
          return v;
        });

      } );
      return panel;
    },

    namedPanel: function createNamedPanelView( parent, panelData, options ) {
      var panel = $('<div/>' ).addClass( options.styleClass||'namedPanel' );
      var panelTitle = $('<div/>', {text: panelData.name } ).addClass( 'unselectable ' + (options.titleClass||'panelTitle'));
      panel.append( panelTitle );

      var expandedClass = options.expandedClassName || 'expanded';
      if( options.expandable )
      {
        panel.addClass( 'expandablePanel' );
        panelTitle.addClass( 'clickable' ).on( 'click', function() {
          panel.toggleClass( expandedClass );
        });
      }
      if( options.isExpanded )
        panel.addClass( expandedClass );

      var content = dispatch( panel, panelData.content, options, function( view, data, options ) {
        return $('<div/>', {text: data} ).appendTo( view );
      });
      content.addClass( 'panelContent' );

      if( content.children().length===0 && options.hideOnEmpty )
        return null;
      else
      {
        parent.append( panel );
        return panel;
      }
    },

    inputField: function createInputField( view, data, options )
    {
      var fieldKey = (data.dataSource.path).replace( /\./g, "_" );
      var panel = $('<div/>' ).addClass( 'inputFieldHolder' ).appendTo( view );
      var field = $('<input>').attr( {
        id: fieldKey,
        name: fieldKey,
        placeholder: data.placeholder
      }).addClass( options.styleClass || 'inputField' ).appendTo( panel );

      if( options.readonly )
        field.addClass('readonly').prop( 'readonly', options.readonly );

      var sourceData = widget.util.get( data.dataSource.type, data.dataSource.path );
      if( sourceData )
        field.val( sourceData );

      field.on( 'propertychange keyup input paste', function(){
        widget.util.set( data.dataSource.type, data.dataSource.path, field.val() );
      });

      return panel;
    },

    checkBox: function( view, data, options ) {
      var label = $('<div/>', {html: data.name} ).addClass( options.styleClass || 'dataCheckBox' ).appendTo( view );

      if( data.excerpt )
        $('<div/>', {html: data.excerpt} ).addClass( options.excerptStyleClass || 'excerpt' ).appendTo( label );

      label.addClass( 'unselectable clickable' ).on( 'click', function(){
        label.toggleClass( 'selected' );
        widget.util.set( data.dataSource.type, data.dataSource.path, label.hasClass('selected') );
      });

      var sourceData = widget.util.get( data.dataSource.type, data.dataSource.path, false );
      if( sourceData )
        label.toggleClass( 'selected', true );

      if( data.dataSource.storeType )
      {
        widget.util.set( data.dataSource.storeType, data.dataSource.path, data );
      }

      return label;
    },

    button: function( view, data, options ) {
      var button = $('<div/>', {text: data.name} ).addClass( options.styleClass || 'dataButton' ).appendTo( view );

      var actionContext = widget.util.get( 'actionManager', data.action );
      if( actionContext )
      {
        button.toggleClass( 'disabled', !actionContext.enabled );
        button.addClass( 'unselectable clickable' ).on( 'click', function(){
          if( actionContext.enabled )
            actionContext.action();
        });

        widget.util.watch( 'actionManager', data.action, function() {
          button.toggleClass( 'disabled', !actionContext.enabled );
        });
      }
      else
        console.warn( "Unbound Action", data.action );


      return button;
    },

    renderer: function createRendererView( view, data, options ) {
      var key = widget.get( data, 'dynamicRenderer', 'Unknown Type' );
      var renderer = widget.util.get( 'renderers', key );
      
      var panel = $('<div/>' ).addClass( 'renderer' ).addClass( key ).appendTo( view );

      if( renderer && renderer.layout )
      {
        var dataStack = widget.util.getData( 'stack', [] ); 
        dataStack.push( data );

        var rendererOptions = $.extend( {}, renderer.options||{}, {
          rendererKey: key
        } );

        var optionsStack = widget.util.getData( 'meta', [] ); 
        optionsStack.push( rendererOptions );
        
        var rendererData = $.extend( {}, renderer.layout );

        var rendererView = dispatch( panel, rendererData, rendererOptions, function( view, data, options ) {
          var v = $('<div/>', {text: data} ).appendTo( view );
          v.addClass( options.styleClass||'listItem' );
          return v;
        });
        
        optionsStack.pop();
        dataStack.pop();
      }
      else
      {
        panel.append( $('<div/>', {text: key } ).addClass('title') );
        panel.append( $('<div/>', {text: JSON.stringify(data) } ).addClass('data') );
      }
      
      if( data.action )
      {
        panel.addClass( 'clickable' ).click( data.action );
      }

      
      return panel;
    },

    chart: function createChartView( view, data, options ) {
      var panel = $('<div/>' ).addClass( 'chart' ).appendTo( view );
      if( options.chartId )
        panel.attr( 'id', options.chartId );
      
      var dataSeriesKey = widget.util.expandPath( data.dataSeries );
      var chartData = widget.util.get( data.dataSource||'data', dataSeriesKey );

      var chartOptions = $.extend( {}, options, {
        type:data.chartType, 
        data:chartData, 
        parent:panel
      });
      
      widget.chartFactory.create( chartOptions );
      return panel;
    },

    error: function createErrorView( view, data, options ) {
      var panel = $('<div/>' ).addClass( 'errorPanel' ).appendTo( view );
      panel.append( $('<div/>', {text: 'To Do:' } ).addClass('title') );
      panel.append( $('<div/>', {text: data.message} ).addClass('errorMessage') );
      return panel;
    }
  };

  return self;
})();

function refreshTab( tabName )
{
  var tab = null;
  var mgr = $('#tabNav').data( 'tabManager' );
  if( mgr )
  {
    $.each( $('#tabNav').data( 'tabManager' ).options.tabData, function( i, t ) {
      if( t.name == tabName )
        tab = t;
    });

    if( tab )
    {
      var holder = tab.view.empty();

      var factory = widget.layout[ tab.type ] || widget.layout.createTabView;
      var view = factory( holder, tab );
      holder.append( view );
    }
  }
}