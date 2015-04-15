var fs = require('fs');

function copyFile(source, target, cb) {
  var cbCalled = false;

  var rd = fs.createReadStream(source);
  rd.on("error", function(err) {
    done(err);
  });
  var wr = fs.createWriteStream(target);
  wr.on("error", function(err) {
    done(err);
  });
  wr.on("close", function(ex) {
    done();
  });
  rd.pipe(wr);

  function done(err) {
    if( cb && !cbCalled ) {
      cb(err);
      cbCalled = true;
    }
  }
}




function main( modelFile ) {
  copyFile( 'src/index.html', 'dist/index.html' );

  var widget = require( './lib/skeleton.js' );
  var model = require( './' + modelFile );
  //console.log( JSON.stringify( widget, null, 2 ) );
  console.log( widget );
}


if( process.argv.length <= 1 )
{
  console.log( "Missing argument: model name" );
}
else
{
  var modelFile = process.argv[2];
  main( modelFile );
}
