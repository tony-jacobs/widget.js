(function registerIconLayout(){
  
  widget.layout.register( 'icon', createIconView, {
    description: "Generates an icon.",
    data: {
      iconUrl: "Templatized URL for the icon image",
      name: "Templatized label for the image",
      linkUrl: "Templatized URL for the clickable target of the link.  This path is templatized TWICE, allowing recursion."
    }
  }, {
    styleClass: 'dataIconHolder',
    iconStyleClass: 'dataIcon',
    labelStyleClass: 'dataLabel',
    iconTitleStyleClass: 'icon titleIcon',
    labelTitleStyleClass: 'titleLabel',
    trackingKey: null
  } );


  function createIconView( view, data, options ) {
    var icon = $('<div/>' ).addClass( options.styleClass ).addClass('unselectable').appendTo( view );

    var iconUrl = widget.util.expandPath( data.iconUrl );
    var displayName = widget.util.expandPath( data.name );

    $('<img/>', {src: iconUrl} ).addClass( options.iconStyleClass ).appendTo( icon );
    $('<div/>', {html: displayName} ).addClass( options.labelStyleClass ).appendTo( icon );

    var action = null;

    if( data.linkUrl )
    {
      var linkUrl = widget.util.expandPath( widget.util.expandPath( data.linkUrl ) );
      if( options.mode=='link' )
        action = createUrlAction( linkUrl );
      else if( options.mode=='cooperativeFrame' )
      {
        var label = $( '<div/>' ).addClass( 'toolTitle' );
        $('<img/>', {src: iconUrl} ).addClass( options.iconTitleStyleClass ).appendTo( label );
        $('<div/>', {html: displayName} ).addClass( options.labelTitleStyleClass ).appendTo( label );

        var parent = options.parentSelector ? $(options.parentSelector) : view.parent();
        action = widget.layout.createCooperativeFrame( parent, linkUrl, label );
      }
      if( action && options.trackingKey )
      {
        var oldAction = action;
        action = function() {
          var obj = {};
          obj[ options.trackingKey ] = 'SELECTED';
          widget.util.track( obj );
          oldAction();
        };
      }
    }

    if( action )
      icon.addClass( 'clickable' ).on( 'click', action );

    return icon;
  }

})();