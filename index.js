var request = require('hyperquest');
var Divshot = require('divshot');
var through = require('through');
var split = require('split');
var JSUN = require('jsun');

var uploader = function (options) {
  var stream = through().pause();
  var config = options.config;
  var environment = options.environment || 'production';
  var app = buildAppWrapper(options);

  //
  app.builds.create({config: config}, function (err, build) {
    if (err) return stream.emit('error', err);
    
    var xhrOptions = defaultXhrOptions(build);
    
    stream.emit('message', 'Build created');
    stream.emit('message', 'Uploading build');
    
    stream
      .pipe(request(build.loadpoint.tar_url, xhrOptions)) // Send file to server
      .pipe(split(parseServerStream)) // split the server response by new line
      .on('data', function (res) {
        stream.emit(res.event, res.data);
      })
      .on('end', finalizeBuild(stream, app, build, environment));
  });
  
  return stream;
};

// .on('data', this._deploymentData(this._files))
// .on('end', this._deploymentEnd(this._files, done));;

function finalizeBuild (stream, app, build, environment) {
  return function () {
    app.builds.id(build.id).finalize(function (err, response) {
      if (err) return stream.emit('error', err);
      if (response.statusCode < 200 && response.statusCode >= 300) return stream.emit('error', response.body);
      
      stream.emit('message', 'Build finalized');
      stream.emit('releasing');
      
      app.builds.id(build.id).release(environment, function (err, response) {
        if (err) return stream.emit('error', err);
        stream.emit('message', 'Build released');
        stream.emit('pushed');
      });
    });
  }
}

function emitError (stream) {
  return function (err) {
    stream.emit('error', err);
  }
}

function buildAppWrapper (options) {
  var apiOptions = {token: options.token};
  if (options.host) apiOptions.host = options.host;
  var api = new Divshot(apiOptions);
  return api.apps.id(options.config.name);
}

function parseServerStream (data) {
  if (!data) return;
  var parsed = JSUN.parse(data.toString());
  if (parsed.err) throw new Error(parsed.err);
  
  return parsed.json;
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

module.exports = uploader;