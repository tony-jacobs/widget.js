(function registerTableLayout(){

  widget.layout.register( 'table', createTableView, {
    description: "Creates a table composed of a header and a list of viewers"
  },{
    styleClass: 'tableWidget'
  } );

  function createColumnSortHandler( col, def )
  {
    return function colHeaderClick( context, event ) {
      if( def._sortColumn != col )
      {
        $( '.sortAscending', def.headerView ).toggleClass( 'sortAscending', false );
        $( '.sortDescending', def.headerView ).toggleClass( 'sortDescending', false );
        def._sortColumn = col;
      }

      col.options.sortDirection = (col.options.sortDirection == 'asc') ? 'desc' : 'asc';
      context.view.toggleClass( 'sortAscending', (col.options.sortDirection=='asc') );
      context.view.toggleClass( 'sortDescending', (col.options.sortDirection=='desc') );
      def.contentView.trigger( 'widget-update' );
    };
  }

  function createHeaderLayout( columns, options, def )
  {
    var headerLayout = {
      type: 'list',
      content: [],
      options: $.extend( {}, options, {
        styleClass: options.headerStyleClass ||'headerRow'
      })
    };

    var i;
    for( i=0; i<columns.length; i++ )
    {
      var col = columns[i];
      var headerItem = {
        type: 'label',
        options: $.extend( {}, col.options )
      };

      if( headerItem.options.sortable )
      {
        headerItem.options.events = headerItem.options.events || {};
        headerItem.options.events.click = createColumnSortHandler( col, def );
      }

      if( col.name !== undefined )
        headerItem.name = col.name;
      else
        headerItem.name = 'Column ' + (i+1);

      var colClass = 'column';
      if( col.options && col.options.styleClass )
        colClass = colClass + ' ' + col.options.styleClass;
      headerItem.options.styleClass = colClass;

      headerLayout.content.push( headerItem );
    }
    delete headerLayout.options.events;

    return headerLayout;
  }

  function createColumnSortFunction( def )
  {
    return function columnSort( dataA, dataB ) {

      if( def._sortColumn )
      {
        var col = def._sortColumn;
        var a = ""+widget.util.expandPath( col.data, dataA );
        var b = ""+widget.util.expandPath( col.data, dataB );

        return widget.get( col, 'options.sortDirection', 'asc' ) =='desc' ? b.localeCompare( a ) : a.localeCompare( b );
      }
      return 0;
    };
  }

  function createContentCell( col )
  {
    var rowItem;
    if( $.type( col.data ) == 'object' )
    {
      rowItem = $.extend( {}, col.data );
    }
    else
    {
      rowItem = $.extend( {}, col, {
        type: col.type || 'label'
      });

      if( col.data !== undefined )
      {
        rowItem.name = col.data;
        delete rowItem.data;
      }
      else if( col.name !== undefined )
        rowItem.name = col.name;
      else
        rowItem.name = '';
    }

    var styleClass = 'column ' + (rowItem.options.styleClass||'');
    rowItem.options = $.extend( {}, rowItem.options, col.options );  // clone options for mutation
    rowItem.options.styleClass = styleClass + ' ' + (col.options.styleClass||'');

    return rowItem;
  }

  function createContentLayout( columns, dataSource, options, def )
  {
    options = options||{};
    var renderer = {
      type: "renderer",
      options: {
        styleClass: options.rowStyleClass || 'tableRow'
      },
      layout: {
        type: "list",
        content: []
      }
    };

    var contentOptions = $.extend( {}, options, {
      styleClass: options.contentStyleClass ||'tableContent',
      renderer: renderer
    });

    if( !contentOptions.sortBy )
    {
      var sortFunction = createColumnSortFunction( def );
      if( sortFunction )
        contentOptions.sortBy = sortFunction;
    }

    renderer.options.events = options.events;
    delete contentOptions.events;

    var contentLayout = {
      type: 'list',
      dataSource: dataSource,
      options: contentOptions
    };

    for( var i=0; i<columns.length; i++ )
    {
      renderer.layout.content.push( createContentCell( columns[i]) );
    }

    return contentLayout;
  }

  function createTableView( def )
  {
    var headerLayout = createHeaderLayout( def.layout.columns, def.options, def );
    var contentLayout = createContentLayout( def.layout.columns, def.layout.dataSource, def.layout.contentOptions, def );

    var holder = $('<div/>').addClass( def.options.styleClass );

    var contextStack = [ def.stack[1]||def.data ];
    def.headerView = widget.layout( holder, headerLayout, undefined, contextStack );

    def.table = {
      header: headerLayout,
      content: contentLayout
    };

    contentLayout.options.events = {
      ready: function onListReady( context, event ) {
        def.table.data = context.layout.content;
      }
    };
    def.contentView = widget.layout( holder, contentLayout, undefined, contextStack );

    return holder.appendTo( def.parent );
  }
})();
