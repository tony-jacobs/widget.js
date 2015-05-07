(function registerListLayout(){
  
  var dispatch = widget.layout.register( 'list', createListView, {
    description: "Creates a list of widgets from a content array or from a data source"
  }, {
    styleClass: 'listPanel'
  } );

  function createItem( holder, item, listOptions, stack )
  {
    var options = { 
      listOptions: listOptions, 
      factory: listOptions.itemFactory
    };
    
    var itemView = widget.layout( holder, item, options, stack );
    
    return itemView;
  }

  function createListView( def )
  {
    var parent = def.parent;
    var listData = def.layout;
    var listOptions = def.options;
    
    var panel = $('<div/>' ).appendTo( parent );
    $.each( ['max-width', 'margin-right'], function( i, key ) {
      if( listOptions[ key ] ) 
        panel.css( key, listOptions[key] );
    });
    
    var holder = panel;
    
    var data = listData.content || [];
    var dataStack = def.stack || [data];
    
    if( def.data )
      dataStack.unshift( def.data );
      
    var layoutItem = function layoutItem( item ) {
      var itemData;
      if( item.data )
        itemData = item.data;
      else if( item.dataSource || def.layout.dataSource )
        itemData = item;

      if( itemData )
        dataStack.unshift( itemData );
      createItem( holder, item, listOptions, dataStack );
      if( itemData )
        dataStack.shift( itemData );
    };

    // if data is a knockout observable, add a listener
    if( $.isFunction( data ) && $.isFunction( data.subscribe ) )
    {
      data.subscribe( function onListChanged( changes ) {
        for( var i=0; i<changes.length; i++ )
        {    
          var change = changes[i];

          if( change.status == 'added' )
            layoutItem( change.value );
          else if( change.status == 'deleted' )
          {
            $("."+change.value._vuid).remove();
            $( parent ).trigger( 'widget-update', def );
          }
          else
            console.error( "Unknown array change:", change.index, change.status, change.value ); 
        }
      }, undefined, 'arrayChange' );
      data = listData.content();
    }
    
    if( listOptions.holderClass )
      holder = $('<div/>' ).addClass( listOptions.holderClass ).appendTo( panel );

    $.each( data, function( i, item ) {
      layoutItem( item );
    } );
    return panel;
  }

})();