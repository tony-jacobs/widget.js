(function registerListLayout(){
  
  var dispatch = widget.layout.register( 'list', createListView, {
    description: "TODO!"
  } );

  function createListView( parent, listData, listOptions ) {
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
  }

})();