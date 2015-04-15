var Search = (function() {

  // tonyj: Use 0ms for the dispatch timeout - yield thread and makes process
  //        asynchronous without an actual wait state.
  var DISPATCH_TIMEOUT = 0;

  var index = lunr(function () {
    this.field('title', {boost: 10});
    this.field('content');
    this.field('metaContent');
    this.field('keywords', {boost: 10});
    this.ref('key');
  });

  index.data = {};


  var dispatcher = function() {
    if( index._pending )
    {
      var kv = index._pending.shift();
      index.appendRecord( kv.key, kv.record, true );
      if( index._pending.length === 0 )
      {
        delete index._pending;
        console.log( "Search index completed in " + ( new Date().getTime() - index._pend_time ) + " ms" );
        delete index._pend_time;
        delete index._dispatcher;
      }
      else
      {
        index._dispatcher = setTimeout( dispatcher, DISPATCH_TIMEOUT );
        if( !index._now_time )
          index._now_time = index._pend_time;
        var now = new Date().getTime();
        if( now > index._now_time + 1000 )
        {
          index._now_time = now;
          console.log( "Search index processing... (" + index._pending.length + " records remaining)" );
        }
      }
    }
  };

  index.appendRecord = function appendRecord( key, record, appendImmediate ) {
    if( appendImmediate )
    {
      index.add( record, false );
      index.data[ key ] = record;
    }
    else
    {
      if( !index._pending )
      {
        index._pend_time = new Date().getTime();
        index._pending = [];
      }
      index._pending.push( {key:key, record:record} );

      if( ! index._dispatcher )
      {
        index._dispatcher = setTimeout( dispatcher, DISPATCH_TIMEOUT );
      }
      return;
    }
  };

  index.updateRecord = function updateRecord( key, record )
  {
    index.update( record );
    index.data[ key ] = record;
  };

  index.removeRecord = function removeRecord( key, record )
  {
    index.remove( record );
    delete index.data[key];
  };

  return index;
})();
