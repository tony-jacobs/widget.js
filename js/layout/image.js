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
    var url = widget.util.expandPath( data.url );
        
    var image = $('<img/>', {src: url} ).addClass('unselectable').appendTo( view );
    return image;
  }

})();