(function registerListLayout(){
  
  var dispatch = widget.layout.register( 'list', createListView, {
    description: "TODO!"
  }, {
    styleClass: 'listPanel'
  } );

  function createItem( holder, item, listOptions )
  {
    var itemView = widget.layout( holder, item, { 
      listOptions: listOptions, 
      factory: listOptions.itemFactory
    } );
    
    return itemView;
  }

  function createListView( parent, listData, listOptions ) {
    
    var panel = $('<div/>' ).appendTo( parent );
    $.each( ['max-width', 'margin-right'], function( i, key ) {
      if( listOptions[ key ] ) 
        panel.css( key, listOptions[key] );
    });
    
    var holder = panel;
    
    if( listOptions.holderClass )
      holder = $('<div/>' ).addClass( listOptions.holderClass ).appendTo( panel );

    $.each( listData.content, function( i, item ) {
      createItem( holder, item, listOptions );
    } );
    return panel;
  }

})();