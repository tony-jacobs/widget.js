(function registerTabGroupLayout(){
  
  widget.layout.register( 'tabGroup', createTabGroup, {
    description: "TODO!"
  } );


  function createTabGroup( def )
  {
    var view = def.parent;
    var data = def.layout;
    var options = def.options;
    
    var labelHolderClass = options.labelHolder || 'labels';
    var tabOptions = $.extend( {}, options, {
      tabData: data.content,
      labelSelector: "." + labelHolderClass
    } );
    var tabGroup = $('<div/>').addClass( labelHolderClass ).appendTo( view );
    var tabNav = widget.generateTabs( view, tabOptions );
    var tabManager = tabNav.data('tabManager');

    $.each( data.content, function( i, tabData ) {
      var tabContent = dispatch( tabData.view, tabData.content, {}, function( view, data, options ) {
        var v = $('<div/>', {text: data} ).appendTo( view );
        v.addClass( options.styleClass||'tabItem' );
        return v;
      });
    } );
    
    return tabGroup;
  }

})();