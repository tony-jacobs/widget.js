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
    var defaultSortColumn;
    if( def.options.defaultSortIndex !== undefined )
    {
      defaultSortColumn = def.data.columns[ def.options.defaultSortIndex ];
    }

    function doCompare( col, dataA, dataB )
    {
      var a = ""+widget.util.expandPath( col.data, dataA );
      var b = ""+widget.util.expandPath( col.data, dataB );

      return widget.util.alphanumericCompare( a, b );
    }

    var sortFunc = function columnSort( dataA, dataB ) {
      var result = 0;
      var sortDirection = 1;

      if( def._sortColumn )
      {
        var col = def._sortColumn;
        sortDirection = ( widget.get( col, 'options.sortDirection', 'asc' ) == 'desc' ) ? -1 : 1;

        result = doCompare( col, dataA, dataB );
      }

      if( result === 0 && defaultSortColumn )
      {
        result = doCompare( defaultSortColumn, dataA, dataB );
      }

      return sortDirection * result;
    };
    return sortFunc;
  }

  function createContentCell( col )
  {
    col.options = col.options || {};

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

    rowItem.options = rowItem.options||{};
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

    if( def.options.defaultSortIndex !== undefined )
    {
      var col = columns[0];
      def._sortColumn = col;
      col.options.sortDirection = col.options.sortDirection || 'asc';
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
    var holder = $('<div/>').addClass( def.options.styleClass );
    var contextStack = [ def.stack[1]||def.data ];

    var headerLayout;

    if( def.options.columnHeaders || def.options.columnHeaders === undefined )
    {
      headerLayout = createHeaderLayout( def.layout.columns, def.options, def );
      def.headerView = widget.layout( holder, headerLayout, undefined, contextStack );
    }
    else
    {
      headerLayout = null;
    }

    var contentLayout = createContentLayout( def.layout.columns, def.layout.dataSource, def.layout.contentOptions, def );

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
