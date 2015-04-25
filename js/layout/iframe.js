(function registerInlineFrameLayout(){
  
  widget.layout.register( 'iframe', createInlineFrameView, {
    description: "Creates an iframe element.",
    data: {
      url: "URL to use as the src parameter on the iframe"
    }
  }, {
    styleClass: 'frameHolder',
    browserControls: false
  } );
  

  function createInlineFrameView( def )
  {
    var view = def.parent;
    var data = def.layout;
    var options = def.options;
    
    var frameHolder = $('<div/>').appendTo( view );
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