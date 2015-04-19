(function registerIconLayout(){
  
  widget.layout.register( 'icon', createIconView, {
    description: "TODO!"
  } );


  function createIconView( view, data, options ) {
    var icon = $('<div/>' ).addClass( options.styleClass || 'dataIconHolder' ).addClass('unselectable').appendTo( view );

    var iconUrl = widget.util.expandPath( data.iconUrl );
    var displayName = widget.util.expandPath( data.name );

    $('<img/>', {src: iconUrl} ).addClass( options.iconStyleClass || 'dataIcon' ).appendTo( icon );
    $('<div/>', {html: displayName} ).addClass( options.labelStyleClass || 'dataLabel' ).appendTo( icon );

    var action = null;

    if( data.linkUrl )
    {
      var linkUrl = widget.util.expandPath( widget.util.expandPath( data.linkUrl ) );
      if( options.mode=='link' )
        action = createUrlAction( linkUrl );
      else if( options.mode=='cooperativeFrame' )
      {
        var label = $( '<div/>' ).addClass( 'toolTitle' );
        $('<img/>', {src: iconUrl} ).addClass( options.iconTitleStyleClass || 'icon titleIcon' ).appendTo( label );
        $('<div/>', {html: displayName} ).addClass( options.labelTitleStyleClass || 'titleLabel' ).appendTo( label );

        var parent = options.parentSelector ? $(options.parentSelector) : view.parent();
        action = createCooperativeFrame( parent, linkUrl, label );
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