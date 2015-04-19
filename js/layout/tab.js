(function registerTabLayout(){
  
  var dispatch = widget.layout.register( 'tab', defaultTabView, {
    description: "TODO!"
  } );

  // convenience alias
  widget.layout.register( 'Tab', defaultTabView, widget.layout.documentation.tab );
  widget.layout.register( 'HiddenTab', defaultTabView, widget.layout.documentation.tab );



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
    
    parent.append( tabView );
    return tabView;
  }

})();