(function registerTableLayout(){

  widget.layout.register( 'table', createTableView, {
    description: "Creates a table composed of a header and a list of viewers"
  },{
    styleClass: 'tableWidget'
  } );

  function createHeaderLayout( columns, options )
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

  function createContentLayout( columns, dataSource, options )
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

    renderer.options.events = options.events;
    delete contentOptions.events;

    var contentLayout = {
      type: 'list',
      dataSource: dataSource,
      options: contentOptions
    };

    var i;
    for( i=0; i<columns.length; i++ )
    {
      var col = columns[i];
      var rowItem = $.extend( {}, col, {
        type: col.type || 'label',
        options: $.extend( {}, col.options )
      });

      if( col.data !== undefined )
      {
        rowItem.name = col.data;
        delete rowItem.data;
      }
      else if( col.name !== undefined )
        rowItem.name = col.name;
      else
        rowItem.name = 'Column ' + (i+1);

      var colClass = 'column';
      if( col.options && col.options.styleClass )
        colClass = colClass + ' ' + col.options.styleClass;
      rowItem.options.styleClass = colClass;

      renderer.layout.content.push( rowItem );
    }

    return contentLayout;
  }

  function createTableView( def )
  {
    var headerLayout = createHeaderLayout( def.layout.columns, def.options );
    var contentLayout = createContentLayout( def.layout.columns, def.layout.dataSource, def.layout.contentOptions );

    var holder = $('<div/>').addClass( def.options.styleClass );

    var contextStack = [ def.stack[1]||def.data ];
    widget.layout( holder, headerLayout, undefined, contextStack );

    def.table = {
      header: headerLayout,
      content: contentLayout
    };

    contentLayout.options.events = {
      ready: function onListReady( context, event ) {
        def.table.data = context.layout.content;
      }
    };
    widget.layout( holder, contentLayout, undefined, contextStack );

    return holder.appendTo( def.parent );
  }
})();
