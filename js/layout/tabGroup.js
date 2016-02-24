(function registerTabGroupLayout(){
  
  widget.layout.register( 'tabGroup', createTabGroup, {
    description: "TODO!"
  } );


  function createTabGroup( def )
  {
    var view = def.parent;
    var data = def.layout;
    var options = def.options;
    
    var labelHolderClass = options.labelHolder || 'labels';
    var tabOptions = $.extend( {}, options, {
      tabData: data.content,
      labelSelector: "." + labelHolderClass
    } );

    var tabGroup = $( tabOptions.labelSelector, view );
    if( !tabGroup || !tabGroup.length )
      tabGroup = $('<div/>').addClass( labelHolderClass ).appendTo( view );
    var tabNav = widget.ui.generateTabs( view, tabOptions );
    var tabManager = tabNav.data('tabManager');


    var dataStack = def.stack || [data];
    if( def.data )
      dataStack.unshift( def.data );
    
    $.each( data.content, function( i, item ) {
      
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
    
    return tabGroup;
  }

})();