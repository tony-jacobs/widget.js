(function registerSelectorLayout(){
  
  widget.layout.register( 'selector', createSelectorView, {
    description: "TODO!"
  },
  {
    styleClass: 'dataSelectLabel'
  });


  function createSelectorView( def )
  {
    var view = def.parent;
    var data = def.layout;
    var options = def.options;
    
    if( !data.items )
    {
      var listDataSource = widget.get( options, 'listDataSource', null );
      if( listDataSource )
      {
        data.items = widget.util.get( listDataSource.type, listDataSource.path );
      }
    }

    if( data.items )
    {
      var selector = $('<select/>', {name: data.name, id: data.name} );

      var sourceData = widget.util.get( data.dataSource.type, data.dataSource.path );

      $.each( data.items, function( i, item ){
        if( $.type( item ) === "string" )
          item = { key:item, name:item, displayName:item };

        var displayName = item.displayName || (item.key + ": " + item.name);
        var opt = $( '<option/>', { value: item.key, html: displayName } ).appendTo( selector );

        if( sourceData && (item.key == sourceData) )
          opt.prop( 'selected', true );
      } );

      selector.addClass('unselectable');
      selector.on( 'selectmenuchange', function( event ){
        widget.util.set( data.dataSource.type, data.dataSource.path, selector.val() );
      });
      var uiMenu = selector.appendTo( view ).selectmenu({
        width: 360,
        icons: { button: "fa fa-caret-down" } });
      return selector;
    }
    else
    {
      console.log( "Omitting selector", data, "No list items found" );
      return null;
    }
  }

})();