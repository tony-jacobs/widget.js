(function registerMenuWidget(){

  
  widget.layout.register( 'menu', createMenuView, {
    description: "Creates a menu widget"
  },{
    styleClass: 'menuWidgetHolder'
  } );
  
  function addItem( content, item )
  {
    content.push( item );
  }
  
  function createMenuView( def ) 
  {
    //console.log( def, def.options );
    
    var menuClass = def.options.menuStyleClass||"menuWidget";
    var labelClass = def.options.menuLabelClass||"menuLabel";
    var indicatorClass = def.options.menuIndicatorClass||"menuIndicator";
    var bodyClass = def.options.menuBodyClass||"menuBody";
    
    var menuContent = ko.observableArray( def.layout.content||[] );
    
    var menuLayout = { 
      type:"list", 
      options:{
        styleClass:( menuClass ),
        events: {
          click: function onClick( context, event ) {
            $('.'+indicatorClass, context.view ).toggleClass( 'fa-rotate-180' );
            $('.'+bodyClass, context.view ).slideToggle( 'fast' );
          },
          ready: function onReady( context, event ) {
            $('.'+bodyClass, context.view ).hide();
          }
        }
      }, 
      content: [
        { type: "label", name:def.layout.name, options:{ styleClass:labelClass }},
        { type: "label", name:"<i class='fa fa-angle-down'></i>", options:{ styleClass:indicatorClass }},
        { type: "list", options:{styleClass:bodyClass}, content: menuContent }
      ]
    };

    if( def.layout.dataSource )
    {
      var items = widget.util.get( def.layout.dataSource.type, def.layout.dataSource.path ) || [];
      
      // Upgrade (or create) the datasource as an observable array
      if( $.isArray( items ) )
      {
        for( var i in items )
        {
          addItem( menuContent, items[i] );
        }
        items = ko.observableArray( items );
        widget.util.set( def.layout.dataSource.type, def.layout.dataSource.path, items );
      }
      
      // if data is a knockout observable, add a listener
      if( $.isFunction( items ) && $.isFunction( items.subscribe ) )
      {
        items.subscribe( function onListChanged( changes ) {
          for( var i=0; i<changes.length; i++ )
          {    
            var change = changes[i];
  
            if( change.status == 'added' )
            {
              addItem( menuContent, change.value );
            }
            else if( change.status == 'deleted' )
            {
              $("."+change.value._vuid).remove();
              $( def.parent ).trigger( 'widget-update', def );
            }
            else
              console.error( "Unknown array change:", change.index, change.status, change.value ); 
          }
        }, undefined, 'arrayChange' );
      }
    } 
    
    var holder = $('<div/>').addClass( def.options.styleClass );   
    widget.layout( holder, menuLayout );    
    return holder.appendTo( def.parent );    
  }  
  
})();