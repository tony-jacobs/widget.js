(function registerTabLayout(){

  var dispatch = widget.layout.register( 'tab', defaultTabView, {
    description: "TODO!"
  } );

  // convenience alias
  widget.layout.register( 'Tab', defaultTabView, widget.layout.documentation.tab );
  widget.layout.register( 'HiddenTab', defaultTabView, widget.layout.documentation.tab );



  function createTab( def, dataReadyCallback )
  {
    if( def.layout.tabHeader )
    {
      var labelHolder = $('<div/>' ).addClass( 'panelLabel unselectable' ).addClass( def.layout.name +"Header" );

      var titleBlock = $('<span/>').addClass( 'tabTitle' );
      if( "object" == $.type( def.layout.headerLabel ) )
      {
        widget.layout( titleBlock, def.layout.headerLabel );
      }
      else
      {
        var icon = def.layout.icon_on || def.layout.icon;
        if( icon )
          titleBlock.append( $( '<img/>', { src: icon } ).addClass('icon') );

        var name = def.layout.label || def.layout.name;
        if( name )
          titleBlock.append( $( '<div/>', { text: name } ) );
      }

      labelHolder.append( titleBlock );

      labelHolder.hide();
      $( def.layout.tabHeader ).append( labelHolder );
    }

    var panel = $('<div/>').addClass( 'tabContentHolder' );

    var contentPane = $( '<div/>' ).addClass( 'contentPane' ).appendTo( panel );
    contentPane.append( $('<div/>', { text: "Loading..."}) );

    var data = def.layout.layout || {};
    panel.data( data );
    if( $.isFunction( dataReadyCallback ) )
      dataReadyCallback( contentPane, data );

    if( def.layout.tabManager )
    {
      var tabListener = function( event, view ) {
        if( view == def.parent[0] )
          widget.layout.callEvent( def.layout.events, 'tabselected', def.layout, event );
      };

      def.layout.tabManager.eventBus.on( 'defaultTabSelected', tabListener );
      def.layout.tabManager.eventBus.on( 'tabChanged', tabListener );
    }

    return panel;
  }

  function defaultTabView( def )
  {
    var tabView = createTab( def, function( contentPane, data, options ) {
      contentPane.empty();

      var stack = def.stack || (def.data?[def.data]:[]);
      if( data.data )
        stack.push( data.data );

      var view = dispatch( contentPane, data, options, function( view, data, options ) {
        return view.append( $('<pre/>', { text: JSON.stringify( data ) } ) );
      }, stack);

      if( data.data )
        stack.pop();

      return view;
    });
    def.parent.append( tabView );
    return tabView;
  }

})();
