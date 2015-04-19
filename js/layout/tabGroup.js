(function registerTabGroupLayout(){
  
  widget.layout.register( 'tabGroup', createTabGroup, {
    description: "TODO!"
  } );


  function createTabGroup( view, data, options )
  {
    var labelHolderClass = options.labelHolder || 'labels';
    var tabOptions = $.extend( {}, options, {
      tabData: data.content,
      labelSelector: "." + labelHolderClass
    } );
    view.append( $('<div/>').addClass( labelHolderClass ) );
    var tabNav = widget.generateTabs( view, tabOptions );
    var tabManager = tabNav.data('tabManager');

    $.each( data.content, function( i, tabData ) {
      var tabContent = dispatch( tabData.view, tabData.content, {}, function( view, data, options ) {
        var v = $('<div/>', {text: data} ).appendTo( view );
        v.addClass( options.styleClass||'tabItem' );
        return v;
      });
    } );
  }

})();