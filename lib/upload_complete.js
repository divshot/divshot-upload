module.exports = function (stream, files, callback) {
  return function () {
    var unreleased = Object.keys(files)
      .filter(function (key) {
        return !files[key].released;
      })
      .map(function (key) {
        files[key].path = key;
        return files[key];
      });
    
    if (unreleased.length) return stream.emit('unreleased', unreleased);
    
    callback();
  }
};