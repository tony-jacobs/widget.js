(function registerImageLayout(){
  
  widget.layout.register( 'image', createImageView, {
    description: "TODO!"
  } );


  function createImageView( view, data, options ) {
    var image = $('<img/>', {src: data.url} ).addClass( options.styleClass || 'dataImage' ).addClass('unselectable').appendTo( view );
    return image;
  }

})();