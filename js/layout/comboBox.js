(function registerComboBoxLayout(){

  if( $ && $.ui )
  {
    widget.layout.register( 'combobox', createComboBoxView, {
      description: "Simulate a combo box for HTML5 with an auto-complete box"
    },
    {
      styleClass: 'widget-combobox'
    });
  }

  // derived from: http://jqueryui.com/autocomplete/#combobox
  (function( $ ) {

    if( !$.ui )
      return;

    $.widget( "ui.autocomplete", $.ui.autocomplete, {

      _resizeMenu: function() {
        this._super();
        this.menu.element.css( {'width': this.options.inputField().outerWidth( true ) } );
      }

    });

    $.widget( "widgetjs.combobox", {
      _create: function() {
        this.wrapper = $( "<span>" )
          .addClass( "widget-combobox" )
          .insertAfter( this.element );

        this.element.hide();
        this._createAutocomplete();
        this._createShowAllButton();
      },

      _createAutocomplete: function() {
        var selected = this.element.children( ":selected" ),
          value = selected.val() ? selected.text() : "";

        this.input = $( "<input>" )
          .appendTo( this.wrapper )
          .val( value )
          .attr( {
            title: "",
            placeholder: this.options.placeholder || ""
          })
          .addClass( "widget-combobox-input" )
          .autocomplete({
            delay: 0,
            minLength: 0,
            source: $.proxy( this, "_source" ),
            inputField: $.proxy( this, 'inputField' )
          })
          .tooltip({
            tooltipClass: "ui-state-highlight"
          });

        var self = this;
        self.input.on( 'propertychange keyup input paste', function( event, ui ){
          var oldValue = self._value;
          self._value = self.input.val();
          if( oldValue != self._value )
          {
            self.element.trigger( 'comboboxChange', {
              source: 'editor',
              combobox: this,
              value: self._value
            } );
          }
        });

        this._on( this.input, {
          autocompleteselect: function( event, ui ) {
            ui.item.option.selected = true;
            this._trigger( "select", event, {
              item: ui.item.option
            });

            var oldValue = self._value;
            self._value = ui.item.option.value;
            if( oldValue != self._value )
            {
              this.element.trigger( 'comboboxChange', {
                item: ui.item.option,
                source: 'menu',
                combobox: this,
                value: ui.item.option.value
              } );
            }
          },

          autocompletechange: "_onUpdate"
        });
      },

      inputField: function() {
        return this.input;
      },

      _createShowAllButton: function() {
        var input = this.input,
          wasOpen = false;

        var toggleButton = widget.symbol('caret-down')
          .attr( "tabIndex", -1 )
          .appendTo( this.wrapper )
          .addClass( "widget-combobox-toggle" )
          .mousedown(function() {
            wasOpen = input.autocomplete( "widget" ).is( ":visible" );
          })
          .click( function() {
            input.focus();
            if( !wasOpen ) {
              // Pass empty string as value to search for, displaying all results
              input.autocomplete( "search", "" );
            }
          });
        this.input.on( "autocompleteopen", function( event, ui ) {
          toggleButton.toggleClass( 'optionsVisible', true );
        } );
        this.input.on( "autocompleteclose", function( event, ui ) {
          toggleButton.toggleClass( 'optionsVisible', false );
        } );
      },

      _source: function( request, response ) {
        var matcher = new RegExp( $.ui.autocomplete.escapeRegex(request.term), "i" );
        response( this.element.children( "option" ).map(function() {
          var text = $( this ).text();
          if ( this.value && ( !request.term || matcher.test(text) ) )
            return {
              label: text,
              value: text,
              option: this
            };
        }) );
      },

      _onUpdate: function( event, ui ) {
        if( this.options.enforceOptions )
          this._removeIfInvalid(event, ui );
      },

      _removeIfInvalid: function( event, ui ) {
        if( !ui.item ) {
          // Search for a match (case-insensitive)
          var value = this.input.val(),
                      valueLowerCase = value.toLowerCase(),
                      valid = false;
          this.element.children( "option" ).each(function() {
            if ( $( this ).text().toLowerCase() === valueLowerCase ) {
              this.selected = valid = true;
              return false;
            }
          });

          if( !valid ) {
            this.input.val( "" )
                      .attr( "title", value + " didn't match any item" )
                      .tooltip( "open" );
            this.element.val( "" );
            this._delay(function() {
              this.input.tooltip( "close" ).attr( "title", "" );
            }, 2500 );
            this.input.autocomplete( "instance" ).term = "";
          }
        }
      },

      _destroy: function() {
        this.wrapper.remove();
        this.element.show();
      },

      menuWidget: function() {
        return this.input.autocomplete('widget' );
      }
    });
  })( jQuery );


  var panelId = 0;

  function createComboBoxView( def )
  {
    def.options = def.options || {};
    var holder = $('<div/>').addClass( def.options.holderClass || def.options.styleClass+"Holder" );
    var items = def.layout.items;

    if( !def.layout.items )
    {
      var listDataSource = widget.get( def.options, 'listDataSource', null );
      if( listDataSource )
      {
        items = listDataSource.type ? widget.util.get( listDataSource.type, listDataSource.path ) : widget.get( def.stack[1], listDataSource.path );
      }
    }

    if( items )
    {
      var selector = $( '<select/>', {
        id: 'widget-combobox-'+(panelId++)
      } ).appendTo( holder );

      var typeKey = def.data.dataSource ? def.data.dataSource.type : undefined;
      var dataPath = def.data.dataSource ? def.data.dataSource.path : "selector";

      var sourceData = typeKey ? widget.util.get( typeKey, dataPath ) : widget.get( def.stack[1], dataPath );

      // Bail if the data source is empty and we're in autohide.
      if( !sourceData && def.options.autoHide )
        return null;

      if( def.layout.label )
      {
        var label = $('<span/>', { html:def.layout.label } ).addClass( def.options.labelClass || def.options.styleClass+"Label" );
        holder.prepend( label );
      }

      holder.update = function updateMenu( event, context ) {
        var sourceData = typeKey ? widget.util.get( typeKey, dataPath ) : widget.get( def.stack[1], dataPath );

        selector.empty();
        $.each( items, function( i, item ){
          if( $.type( item ) === "string" )
            item = { key:item, name:item, displayName:item };

          var displayName = item.displayName || (item.key + ": " + item.name);
          var opt = $( '<option/>', { value: item.key, html: displayName } ).appendTo( selector );

          if( sourceData && (item.key == sourceData) )
            opt.prop( 'selected', true );
        } );

        selector.combobox( {
          enforceOptions: def.options.enforceListOptions || false,
          placeholder: def.layout.placeholder
        });
        var uiInputField = selector.combobox( 'inputField' ).val( sourceData );
        var uiMenuDropdown = selector.combobox( 'menuWidget' );
        uiMenuDropdown.addClass( def.options.menuClass || def.options.styleClass+"Menu" );

        $( selector ).on( 'comboboxChange', function( event, context ) {
          var oldValue = typeKey ? widget.util.get( typeKey, dataPath ) : widget.get( def.stack[1], dataPath );

          if( typeKey )
            widget.util.set( typeKey, dataPath, context.value );
          else
            widget.set( def.stack[1], dataPath, context.value );

          holder.trigger( 'fieldChange' );
          if( oldValue != context.value )
            holder.trigger( 'change' );
        });

        selector.addClass('unselectable');
      };
    }
    else
    {
      console.warn( "Omitting combobox", def, "No list items found" );
      return null;
    }

    def.parent.append( holder );
    return holder;
  }

})();
