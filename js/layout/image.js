(function registerImageLayout(){
  
  widget.layout.register( 'image', createImageView, {
    description: "Creates an image holder",
    data: {
      url: "URL to use as the image source"
    }
  },
  {
    styleClass: 'dataImage'
  });


  function createImageView( view, data, options ) {
    var image = $('<img/>', {src: data.url} ).addClass( options.styleClass ).addClass('unselectable').appendTo( view );
    return image;
  }

})();