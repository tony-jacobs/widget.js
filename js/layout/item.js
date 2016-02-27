(function layoutClosure(){

  widget.layout.register( 'item', createItemWidget, {
    description: "Creates an item widget (with a label and value).  This is a convenience widget to create a list with a label and value"
  },{
    styleClass: 'item'
  } );

  function addEntry( content, layout, options, key )
  {
    if( layout[key] )
    {
      if( 'string' == $.type( layout[key] ) )
      {
        content.push( {
          type: 'label',
          name: layout[key],
          options:{
            styleClass: key + ' ' + (options[ key+'Class' ]||"") ,
            unselectable: false
          }
        });
      }
      else // the layout is a widget, so just push it
      {
        content.push( layout[key] );
      }
    }
  }

  var itemId=0;
  function createItemWidget( def )
  {
    var layout = {
      type: "list",
      options: {
        styleClass: 'itemHolder ' + (def.options.layoutClass||"")
      },
      content: []
    };

    addEntry( layout.content, def.layout, def.options||{}, 'label' );
    addEntry( layout.content, def.layout, def.options||{}, 'value' );

    var id = "widget-item-" + (++itemId);
    var holder = $( '<div/>' ).attr( { id: id });  // layout adds styleclass automatically

    widget.layout( holder, layout, undefined, def.stack );

    holder.appendTo( def.parent );

    return holder;
  }


})();
