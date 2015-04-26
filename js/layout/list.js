(function registerListLayout(){
  
  var listUID = 0;
  
  var dispatch = widget.layout.register( 'list', createListView, {
    description: "Creates a list of widgets from a content array or from a data source"
  }, {
    styleClass: 'listPanel'
  } );

  function createItem( holder, item, listOptions )
  {
    item._vuid = (listUID++);
    var itemView = widget.layout( holder, item, { 
      listOptions: listOptions, 
      factory: listOptions.itemFactory
    } );
    itemView.addClass( 'vuid-'+item._vuid );
    
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

    // if data is a knockout observable, add a listener
    if( $.isFunction( data ) && $.isFunction( data.subscribe ) )
    {
      data.subscribe( function onListChanged( changes ) {
        for( var i=0; i<changes.length; i++ )
        {    
          var change = changes[i];

          if( change.status == 'added' )
          {
            //console.log( "Add!", change.index, change.status, change.value );
            createItem( holder, change.value, listOptions );
          }
          else if( change.status == 'deleted' )
          {
            $(".vuid-"+change.value._vuid).remove();
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
      createItem( holder, item, listOptions );
    } );
    return panel;
  }

})();