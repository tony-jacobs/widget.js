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

    $.each( data.content, function( i, tabLayout ) {
      var tabContent = widget.layout( tabLayout.view, tabLayout, {} );
    } );
    
    return tabGroup;
  }

})();