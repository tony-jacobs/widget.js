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
        data.items = listDataSource.type ? widget.util.get( listDataSource.type, listDataSource.path ) : widget.get( def.stack[1], listDataSource.path );
      }
    }

    if( data.items )
    {
      var selector = $('<select/>', {name: data.name, id: data.name} );

      var sourceData;
      if( data.dataSource )
      {
        sourceData = data.dataSource.type ? widget.util.get( data.dataSource.type, data.dataSource.path ) : widget.get( def.stack[1], data.dataSource.path );
        
        if( sourceData === undefined && options.autoHide )
          return null;
      }

      $.each( data.items, function( i, item ){
        if( $.type( item ) === "string" )
          item = { key:item, name:item, displayName:item };

        var displayName = item.displayName || (item.key + ": " + item.name);
        var opt = $( '<option/>', { value: item.key, html: displayName } ).appendTo( selector );

        if( sourceData && (item.key == sourceData) )
          opt.prop( 'selected', true );
      } );
      
      if( data.label )
      {
        var holder = $('<div/>').addClass( options.holderClass || options.styleClass+"Holder" );
        var label = $('<span/>', { html:data.label } ).addClass( options.labelClass || options.styleClass+"Label" ).appendTo( holder );
        view.append( holder.append( label ).append( selector ) );
      }
      else
        selector.appendTo( view );

      var uiMenu = selector.selectmenu({
        icons: { button: "fa fa-caret-down" } 
      }).selectmenu('widget');
      
      var uiMenuDropdown = selector.selectmenu( "menuWidget" );
      uiMenuDropdown.addClass( options.menuClass || options.styleClass+"Menu" );
      
      selector.addClass('unselectable');
      uiMenu.addClass( 'unselectable' );

      selector.on( 'selectmenuchange', function( event ){
        if( data.dataSource )
        {
          if( data.dataSource.type )
            widget.util.set( data.dataSource.type, data.dataSource.path, selector.val() );
          else
            widget.set( def.stack[1], data.dataSource.path, selector.val() );
        }
        uiMenu.trigger( 'selectmenuchange' );
      });
      
      // jquery-ui automatically adds a width to the select menu - we insist 
      // that the CSS do that instead
      uiMenu.css('width','');
      
      return uiMenu;
    }
    else
    {
      console.warn( "Omitting selector", data, "No list items found" );
      return null;
    }
  }

})();