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
    $(itemView).data( stack[0] );

    return itemView;
  }

  function sort( def, holder )
  {
    if( def.__sortTimeout === undefined )
    {
      def.__sortTimeout = window.setTimeout( function(){
        delete def.__sortTimeout;

        doSort( def, holder );
      }, 10 );
    }
  }

  function doSort( def, holder )
  {
    if( def.options.sortBy )
    {
      $(holder).children().sortElements( function(a, b){
        return def.options.sortBy( $(a).data(), $(b).data() );
      });
    }
  }

  /**
   * Displays the footer only if there is no content in the given holder.
   */
  function updateFooter( def, holder, footer )
  {
    if( footer.children().length )
    {
      if( !footer.parent().length )
        holder.insertAfter( footer );
    }
    else
    {
      footer.detach();
    }

    var footerMode = widget.get( def, 'options.footerMode', 'emptyContent' );
    if( footerMode == 'emptyContent' )
    {
      if( footer.children().length )
       footer.toggle( (holder.children().length === 0) );
    }
    else
      footer.toggle( true );
  }

  function createListView( def )
  {
    var parent = def.parent;
    var listData = def.layout;
    var listOptions = def.options;

    var formKey = widget.get( def, 'options.form', false );
    var panel = formKey ? $('<form/>' ) : $('<div/>' );

    if( formKey )
    {
      if( $.type( formKey ) === 'string' )
        panel.addClass( formKey );

      panel.on( 'validate', function() {
        var $validatables = panel.find( '.validate' );
        $validatables.trigger( 'validate', def );
      });
    }

    var holder = panel.appendTo( parent );
    var footer = $('<div/>').addClass( listOptions.footerStyleClass || 'footer' ).appendTo( parent ).toggle( false );
    $.each( ['max-width', 'margin-right'], function( i, key ) {
      if( listOptions[ key ] )
        panel.css( key, listOptions[key] );
    });

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

      if( !(def.options) || !(def.options.filter) || (def.options.filter(item)) )
        createItem( holder, item, listOptions, dataStack );

      if( itemData )
        dataStack.shift( itemData );
    };

    // if data is a knockout observable, add a listener
    if( $.isFunction( data ) && $.isFunction( data.subscribe ) )
    {
      var resort = false;
      data.subscribe( function onListChanged( changes ) {
        for( var i=0; i<changes.length; i++ )
        {
          var change = changes[i];

          if( change.status == 'added' )
          {
            layoutItem( change.value );
            resort = true;
            updateFooter( def, holder, footer );
          }
          else if( change.status == 'deleted' )
          {
            $("."+change.value._vuid).remove();
            $( parent ).trigger( 'widget-update', def );
            updateFooter( def, holder, footer );
          }
          else
            console.error( "Unknown array change:", change.index, change.status, change.value );
        }
        if( resort )
          sort( def, holder );
      }, undefined, 'arrayChange' );
      data = listData.content();
    }

    panel.on( 'itemAdded', function( event, newItem ) {
      layoutItem( newItem );
      updateFooter( def, holder, footer );
      sort( def, holder );
      return false;
    });

    if( listOptions.holderClass )
      holder = $('<div/>' ).addClass( listOptions.holderClass ).appendTo( panel );

    $.each( data, function( i, item ) {
      layoutItem( item );
    } );

    sort( def, holder );

    panel.appendTo( parent );
    footer.appendTo( parent );
    if( listOptions.footerLayout )
      widget.layout( footer, listOptions.footerLayout, {}, dataStack );

    updateFooter( def, holder, footer );

    panel.update = function( event, context ) {
      sort( def, holder );
    };
    return panel;
  }

})();
