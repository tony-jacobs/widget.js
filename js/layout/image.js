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


  function createImageView( def )
  {
    var view = def.parent;

    var image = $('<img/>' ).addClass('unselectable').appendTo( view );
    
    if( def.layout.defaultUrl )
    {
      if( !def.layout.url )
        def.layout.url = def.layout.defaultUrl;
        
      image.error( function (){
        $(this).unbind( "error" ).attr( "src", def.layout.defaultUrl );
      });
    }
    
    image.update = function updateImage( event, context ) {
      if( context && context.stack )
      {
        def.stack = context.stack;
      }

      var url = widget.util.expandPath( def.layout.url, def.stack[0] );
      image.attr( 'src', url );
    };
    
    return image;
  }

})();