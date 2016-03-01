(function registerTabLayout(){

  var dispatch = widget.layout.register( 'tab', defaultTabView, {
    description: "TODO!"
  } );

  // convenience alias
  widget.layout.register( 'Tab', defaultTabView, widget.layout.documentation.tab );
  widget.layout.register( 'HiddenTab', defaultTabView, widget.layout.documentation.tab );



  function createTab( parent, options, dataReadyCallback ) {

    if( options.tabHeader )
    {
      var labelHolder = $('<div/>' ).addClass( 'panelLabel unselectable' ).addClass( options.name +"Header" );

      var titleBlock = $('<span/>').addClass( 'tabTitle' );
      if( "object" == $.type( options.headerLabel ) )
      {
        widget.layout( titleBlock, options.headerLabel );
      }
      else
      {
        var icon = options.icon_on || options.icon;
        if( icon )
          titleBlock.append( $( '<img/>', { src: icon } ).addClass('icon') );

        var name = options.label || options.name;
        if( name )
          titleBlock.append( $( '<div/>', { text: name } ) );
      }

      labelHolder.append( titleBlock );

      labelHolder.hide();
      $( options.tabHeader ).append( labelHolder );
    }

    var panel = $('<div/>').addClass( 'tabContentHolder' );

    var contentPane = $( '<div/>' ).addClass( 'contentPane' ).appendTo( panel );
    contentPane.append( $('<div/>', { text: "Loading..."}) );

    var data = options.layout || {};
    panel.data( data );
    if( $.isFunction( dataReadyCallback ) )
      dataReadyCallback( contentPane, data );

    if( options.tabManager )
    {
      var tabListener = function( event, view ) {
        if( view == parent[0] )
          widget.layout.callEvent( options.events, 'tabselected', options, event );
      };

      options.tabManager.eventBus.on( 'defaultTabSelected', tabListener );
      options.tabManager.eventBus.on( 'tabChanged', tabListener );
    }

    return panel;
  }

  function defaultTabView( def )
  {
    var parent = def.parent;
    var tabData = def.layout;
    var options = def.options;

    var tabView = createTab( parent, tabData, function( contentPane, data, options ) {
      contentPane.empty();

      return dispatch( contentPane, data, options, function( view, data, options ) {
        return view.append( $('<pre/>', { text: JSON.stringify( data ) } ) );
      });
    });
    parent.append( tabView );
    return tabView;
  }

})();
