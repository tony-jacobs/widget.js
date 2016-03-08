(function registerTabGroupLayout(){

  widget.layout.register( 'tabGroup', createTabGroup, {
    description: "TODO!"
  } );


  function createTabGroup( def )
  {
    var view = def.parent;
    var data = def.layout;
    var options = def.options || {};

    var labelHolderClass = options.labelHolder || 'labels';
    var tabOptions = $.extend( {}, options, {
      tabData: data.content,
      labelSelector: "." + labelHolderClass
    } );

    var tabGroup = $( tabOptions.labelSelector, view );
    if( !tabGroup || !tabGroup.length )
      tabGroup = $('<div/>').addClass( labelHolderClass ).appendTo( view );

    var dataStack = def.stack || [data];
    if( def.data )
      dataStack.unshift( def.data );

    var tabNav = widget.ui.generateTabs( view, tabOptions, dataStack );
    def.tabManager = tabNav.data('tabManager');
    if( options.tabPath )
      widget.ui.setTabManager( def.tabManager, options.tabPath );

    $.each( data.content, function( i, item ) {
      item.tabManager = def.tabManager;

      var itemData;
      if( item.data )
        itemData = item.data;
      else if( item.dataSource || def.layout.dataSource )
        itemData = item;

      if( itemData )
        dataStack.unshift( itemData );
      widget.layout( item.view, item, {}, dataStack );
      if( itemData )
        dataStack.shift( itemData );
    } );

    // Forward tab events into traditional widget event hierarchy
    var tabListener = function( event, view ) {
      widget.layout.callEvent( options.events, 'tabselected', def, event );
    };
    def.tabManager.eventBus.on( 'defaultTabSelected', tabListener );
    def.tabManager.eventBus.on( 'tabChanged', tabListener );

    return tabGroup;
  }

})();
