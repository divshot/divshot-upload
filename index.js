var request = require('hyperquest');
var through = require('through');
var jsonstream = require('JSONStream');

var uploadComplete = require('./lib/upload_complete');
var finalizeBuild = require('./lib/finalize_build');
var fileTracker = require('./lib/file_tracker');
var initApi = require('./lib/api');

var fileTypes = {
  tar: 'tar_url',
  zip: 'zip_url'
};

var upload = function (options) {
  var stream = through().pause();
  var fileType = options.type || 'tar';
  var config = options.config;
  var environment = options.environment || 'production';
  var divshotApi = initApi(options);
  var app = divshotApi.currentApp;
  var api = divshotApi.self;
  
  stream.emit('message', 'Creating build ... ');
  deploy(config);
  
  return stream;
  
  function deploy (config) {
    var files = options.files || {};
    
    app.builds.create({config: config}, function (err, build) {
      if (err) return stream.emit('error', 'Failed to initiate deploy: ' + err);
      
      // App doesn't exist, create it
      if (typeof build === 'string' && build.toLowerCase().indexOf('not found') > -1) return createAppBeforeBuild(config);
      
      if (build && build.status == 401) return stream.emit('error', build);
      if (!build || !build.loadpoint) return stream.emit('error', 'Failed to deploy application. Please try again.');
      
      stream.emit('message', 'Build created');
      stream.emit('message', 'Deploying build ... ');
      
      var req = request(build.loadpoint[fileTypes[fileType]], defaultXhrOptions(build));
      
      stream
        
        // send file to server
        .pipe(req)
        
        // split the server response by new line
        .pipe(jsonstream.parse())
        
        // track which files get released and which fail
        .on('data', fileTracker(stream, files))
        
        // // end
        .on('end', uploadComplete(stream, files, finalizeBuild(stream, app, build, environment)))
    });
  }
  
  function createAppBeforeBuild (config) {
    api.apps.create(config.name.toLowerCase(), function (err, response, body) {
      if (err) return stream.emit('error', err);
      if (response.error === 'invalid_token') return stream.emit('error', 'You need to be logged in before you can deploy.');
      if (body.error) return stream.emit('error', body.error);
      if (response.statusCode >= 400) return stream.emit('error', body.error);
      
      stream.emit('message', config.name + ' has been created');
      deploy(config);
    });
  }
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