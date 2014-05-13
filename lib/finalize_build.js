module.exports = function (stream, app, build, environment) {
  var buildApi = app.builds.id(build.id);
  
  return function () {
    if (!stream.done) {
      stream.emit('error', 'Build upload never received "done" event. Assuming upload has failed.');
      return;
    }
    
    stream.emit('message', 'Finalizing build ... ');
    
    buildApi.finalize(function (err, response) {
      if (err) return stream.emit('error', err);
      if (response.statusCode < 200 || response.statusCode >= 300) {
        var res = {};
        
        try {res = JSON.parse(response.body);}
        catch (e) {}
        
        stream.emit('error', res.error);
        
        return stream;
      }
      
      stream.emit('message', 'Build finalized');
      stream.emit('message', 'Releasing build to ' + environment + ' ... ');
      
      buildApi.release(environment, function (err, response) {
        if (err) return stream.emit('error', err);
        stream.emit('message', 'Build released');
        stream.emit('pushed');
      });
    });
  };
};