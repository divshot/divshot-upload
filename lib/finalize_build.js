var chalk = require('chalk');

module.exports = function (stream, app, build, environment) {
  return function () {
    
    stream.emit('message', 'Finalizing build ... ');
    
    app.builds.id(build.id).finalize(function (err, response) {
      if (err) return stream.emit('error', err);
      if (response.statusCode < 200 && response.statusCode >= 300) return stream.emit('error', response.body);
      
      stream.emit('message', 'Build finalized');
      stream.emit('message', 'Releasing build to ' + chalk.bold(environment) + ' ... ');
      
      app.builds.id(build.id).release(environment, function (err, response) {
        if (err) return stream.emit('error', err);
        stream.emit('message', 'Build released');
        stream.emit('pushed');
      });
    });
  };
};