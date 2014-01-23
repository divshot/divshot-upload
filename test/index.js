var fs = require('fs');
var homeDir = require('home-dir');
var JSUN = require('jsun');
var tarzan = require('tarzan');
var Uploader = require('../');
var feedback = require('feedback');
var userConfig = JSUN.parse(fs.readFileSync(homeDir() + '/.divshot/config/user.json').toString()).json;
var through = require('through');

var uploader = new Uploader({
  token: userConfig.token,
  config: {
    name: 'uploadapp',
    root: './'
  }
});

var pack = tarzan({
  directory: __dirname + '/test_app',
});

uploader.push('production', pack)
  .on('message', function (msg) {
    feedback.info(msg);
  })
  .on('released', function (msg) {
    feedback.success('Released ' + msg[Object.keys(msg)[0]]);
  })
  .on('releasing', function () {
    feedback.info('Releasing build...');
  })
  .on('error', function (err) {
    feedback.error(err);
  });