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

    image.update = function updateImage( event, context ) {
      if( context && context.stack )
      {
        def.stack = context.stack;
      }

      if( def.layout.defaultUrl )
      {
        if( !def.layout.url )
          def.layout.url = def.layout.defaultUrl;
          
        image.error( function (){
          $(this).unbind( "error" ).attr( "src", widget.util.expandPath( def.layout.defaultUrl, def.stack[0] ) );
        });
      }

      var url = widget.util.expandPath( def.layout.url, def.stack[0] );
      image.attr( 'src', url );
    };
    
    return image;
  }

})();