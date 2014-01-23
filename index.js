var request = require('hyperquest');
var through = require('through');
var JSONStream = require('jsonstream');

var uploadComplete = require('./lib/upload_complete');
var finalizeBuild = require('./lib/finalize_build');
var fileTracker = require('./lib/file_tracker');
var api = require('./lib/api');

var upload = function (options) {
  var stream = through().pause();
  var config = options.config;
  var environment = options.environment || 'production';
  var app = api(options);
  var files = {}

  //
  app.builds.create({config: config}, function (err, build) {
    if (err) return stream.emit('error', err);
    
    var xhrOptions = defaultXhrOptions(build);
    
    stream.emit('message', 'Build created');
    stream.emit('message', 'Uploading build');
    
    stream
      // send file to server
      .pipe(request(build.loadpoint.tar_url, xhrOptions))
      
      // split the server response by new line
      .pipe(JSONStream.parse()) 
      
      // track which files get released and which fail
      .on('data', fileTracker(stream, files))
      
      // end
      .on('end', uploadComplete(stream, files, finalizeBuild(stream, app, build, environment)));
  });
  
  return stream;
};

function defaultXhrOptions (build) {
  return {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/octet-stream',
      Authorization: build.loadpoint.authorization
    }
  };
}

module.exports = upload;