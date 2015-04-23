(function registerListLayout(){
  
  var dispatch = widget.layout.register( 'list', createListView, {
    description: "TODO!"
  }, {
    styleClass: 'listPanel'
  } );

  function createListView( parent, listData, listOptions ) {
    
    var panel = $('<div/>' ).addClass( listOptions.styleClass ).appendTo( parent );
    $.each( ['max-width', 'margin-right'], function( i, key ) {
      if( listOptions[ key ] ) 
        panel.css( key, listOptions[key] );
    });
    
    var holder = panel;
    
    if( listOptions.holderClass )
      holder = $('<div/>' ).addClass( listOptions.holderClass ).appendTo( panel );

    $.each( listData.content, function( i, item ) {
      
      var typeKey = item.type;
      var itemOptions = $.extend( {}, widget.layout.defaults[typeKey]||{}, { 
        listOptions: listOptions, 
        factory: listOptions.itemFactory
      });
      
      var listItem = dispatch( holder, item, itemOptions, widget.layout.registry.error );

    } );
    return panel;
  }

})();