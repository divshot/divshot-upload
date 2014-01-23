module.exports = function (stream, files) {
  return function (data) {
    switch (data.event) {
      case 'unpack':
        stream.emit('unpack', data.data.path);
        files[data.data.path] || (files[data.data.path] = {}); // for zip uploads
        files[data.data.path].unpacked = true;
        break;
      case 'released':
        stream.emit('released', data.data.path);
        files[data.data.path].released = true;
        break;
      case 'message':
        stream.emit('message', data.data);
        break;
      case '_error':
        files[data.data.path].error = data.data;
        stream.emit('error', data.data);
        break;
      case 'done':
        stream.emit('done');
        break;
    };
  };
};