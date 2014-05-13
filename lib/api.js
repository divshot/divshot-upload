var Divshot = require('divshot-api');
var isNode = require('is-node');

module.exports = function (options) {
  var apiOptions = {
    token: options.token
  };
  
  // Client side only
  if (!isNode) {
    apiOptions.client_id = options.client_id;
    apiOptions.session = true;
  }
  
  if (options.host) apiOptions.host = options.host;
  
  var api = new Divshot(apiOptions);
  return api.apps.id(options.config.name);
};