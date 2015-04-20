(function registerInlineFrameLayout(){
  
  widget.layout.register( 'iframe', createInlineFrameView, {
    description: "TODO!"
  } );
  

  function createInlineFrameView( view, data, options ) {

    var frameHolder = $('<div/>').addClass(options.styleClass || 'frameHolder').appendTo( view );
    var iframe = $( '<iframe></iframe>', {
      frameborder:0,
      scrolling:true,
      marginHeight:0,
      marginwidth:0,
      src: data.url
    }).addClass( 'dataFrame' ).appendTo( frameHolder );

    if( options.browserControls )
    {
      iframe.addClass( 'browserControlTarget' );
      var controlHolder = $('<div/>').addClass('controlHolder').appendTo( frameHolder );
      $('<div/>', {text:'<'}).addClass( 'unselectable clickable button browserButton back' ).click( function(){
        iframe[0].contentWindow.history.back();
      }).appendTo( controlHolder );
      $('<div/>', {text:'>'}).addClass( 'unselectable clickable button browserButton next' ).click( function(){
        iframe[0].contentWindow.history.forward();
      }).appendTo( controlHolder );
    }

    return iframe;
  }

})();