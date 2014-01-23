var Emitter = require('tiny-emitter');
var request = require('request');
var Divshot = require('divshot');
var through = require('through');
var split = require('split');
var JSUN = require('jsun');

var Uploader = function (options) {
  this.token = options.token;
  this.config = options.config;
  this.api = new Divshot({
    token: this.token
  });
  this.app = this.api.apps.id(this.config.name);
};

Uploader.prototype = new Emitter();

Uploader.prototype.push = function (environment, fileStream) {
  var self = this;
  var stream = through();
  
  this.app.builds.create({
    config: this.config 
  }, function (err, build) {
    if (err) return stream.emit('error', err);
    
    stream.emit('message', 'Build created');
    
    var xhrOptions = {
      url: build.loadpoint.tar_url,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/octet-stream',
        Authorization: build.loadpoint.authorization
      }
    };
    
    stream.emit('message', 'Uploading build');
    
    fileStream
      .pipe(request(xhrOptions))
      .pipe(split(self._parseServerStream))
      .on('error', function (err) {
        stream.emit('error', err);
      })
      .on('data', function (res) {
        stream.emit(res.event, res.data);
      })
      .on('end', function () {
        self.finalize(build, function (err, response) {
          if (err) return stream.emit('error', err.message);
          if (response.statusCode < 200 && response.statusCode >= 300) return stream.emit('error', response.body);
          
          stream.emit('message', 'Build finalized');
          stream.emit('releasing');
          
          self.release(environment, build, function (err, response) {
            if (err) return stream.emit('error', err.message);
            stream.emit('message', 'Build released');
          });
        });
      });
      
      
      
      // .on('data', this._deploymentData(this._files))
      // .on('end', this._deploymentEnd(this._files, done));;
    
  });
  
  return stream;
};

Uploader.prototype._parseServerStream = function (data) {
  if (!data) return;
  var parsed = JSUN.parse(data.toString());
  if (parsed.err) throw new Error(parsed.err);
  
  return parsed.json;
};

Uploader.prototype.finalize = function (build, callback) {
  return this.app.builds.id(build.id).finalize(callback);
};

Uploader.prototype.release = function (environment, build, callback) {
  return this.app.builds.id(build.id).release(environment, callback);
};

module.exports = Uploader;