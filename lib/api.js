var Divshot = require('divshot-api');

module.exports = function (options) {
  var apiOptions = {token: options.token};
  if (options.host) apiOptions.host = options.host;
  var api = new Divshot(apiOptions);
  return api.apps.id(options.config.name);
};