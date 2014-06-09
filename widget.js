Widget = {
  model : {
    "widgets" : {
      "w1" : {
        "type": "text",
        "model": { "text":"Foo" },
        "styles": [ {
            "type":"css",
            "model": {  
              "background-color":"#ff00ff",
              "display":"inline-block"
            }
          },
          {
            "type":"animate",
            "duration":500,
            "model": {  
              "background-color":"#00ff00"
            }
          }
        ]
      },
      "w2" : {
        "type": "text",
        "model": { "text":"Bar" },
        "styles": []
      }
    }
  },
  defaultStyle : { 
    "type":"css", 
    "model": {
      'display':'block',
      'width':'400px',
      'height':'50px'
    }
  },
  start : function( container ) {
    var model = Widget.model.widgets;
    var parent = $(container);
   
    $.each( model, function( k,v ) { 
      parent.append( Widget.create( k, v ) );
    });
  },
  registry : {
    "text" : function( widget, view ) {
      return view.text( widget.model.text );
    },
    "default": function( widget, view ) {
      return view.append( "<b>"+k+"</b><code style='white-space:pre;'> "+ JSON.stringify( v, null, "  " ) + "</code><hr>" );
    }
  },
  salon : {
    'css' : function( view, style ) { view.css( style.model ) },
    'animate' : function( view, style ) { console.log( "Animating view", view, style.model ); view.animate( style.model ); }
  },
  create : function( id, widget ) {
    var factory = Widget.registry[ widget.type ]; 
    var view = factory( widget, $( document.createElement( 'div' ) ) );

    Widget.applyStyle( view, Widget.defaultStyle );
    $.each( widget.styles, function( i,style ) { Widget.applyStyle( view, style ); } );

    view.addClass( widget.type );
    view.addClass( id );

    return view;
  },
  applyStyle : function( view, style ) {
    var stylist = Widget.salon[ style.type ];
    if( stylist ) 
      stylist( view, style );
    else
      console.log( "No stylist of type", style.type, "for style", style, "on view", view );
  },
  applyLayout : function( view, layout ) {
  } 
}

$( document ).ready( function() {
  Widget.start( '.widgetRoot' );
});
