(function registerCheckBoxLayout(){
  
  widget.layout.register( 'checkBox', checkBoxView, {
    description: "TODO!"
  }, 
  {
    styleClass: 'dataCheckBox'
  });

  function checkBoxView( def )
  {
    var view = def.parent;
    var data = def.layout;
    var options = def.options;
    
    var label = data.name ? $('<div/>', {html: data.name} ) : $("<label><input type='checkbox'/>" + (data.label||'') +"</label>");
    var checkbox = $('input', label ) || label;

    if( data.excerpt )
      $('<div/>', {html: data.excerpt} ).addClass( options.excerptStyleClass || 'excerpt' ).appendTo( label );

    label.addClass( 'unselectable clickable' );
    checkbox.addClass( 'unselectable clickable' ).on( 'click', function( event ){
      event.stopPropagation();

      label.toggleClass( 'selected' );
      var newVal = label.hasClass('selected');

      if( data.dataSource )
      {
        if( data.dataSource.type )
          widget.util.set( data.dataSource.type, data.dataSource.path, newVal );
        else
          widget.set( def.stack[1], data.dataSource.path, newVal );
      }
      
      label.trigger( 'toggle', { oldVal: !newVal, newVal: newVal } );
    });

    var sourceData;
    if( data.value !== undefined )
      sourceData = widget.util.expandPath( data.value, def.stack[0] );
      
    if( sourceData )
    {
      label.toggleClass( 'selected', true );
      checkbox.attr( 'checked', true );
    }

    if( data.dataSource && data.dataSource.storeType )
    {
      widget.util.set( data.dataSource.storeType, data.dataSource.path, data );
    }
    
    if( options.autoHide && sourceData === undefined )
      return view;
      
    if( data.dataSource )
    {
      label.update = function updateCheckbox( event, context ) {
        var curr = !!(data.dataSource.type ? widget.util.get( data.dataSource.type, data.dataSource.path ) : widget.get( def.stack[1], data.dataSource.path ));
        label.toggleClass( 'selected', curr );
        checkbox.attr( 'checked', curr );
      };
    }

    label.appendTo( view );
    return label;
  }

})();