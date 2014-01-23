var upload = require('../');

var fs = require('fs');
var homeDir = require('home-dir');
var JSUN = require('jsun');
var tarzan = require('tarzan');
var feedback = require('feedback');
var userConfig = JSUN.parse(fs.readFileSync(homeDir() + '/.divshot/config/user.json').toString()).json;
var fileStream = tarzan({ directory: __dirname + '/test_app'});

var uploadOptions = {
  token: userConfig.token,
  environment: 'production',
  config: {
    name: 'uploadapp',
    root: './'
  },
  host: 'http://api.dev.divshot.com:9393'
};

fileStream.pipe(upload(uploadOptions))
  .on('message', function (msg) {
    feedback.info(msg);
  })
  .on('released', function (msg) {
    feedback.success('Released ' + msg);
  })
  .on('releasing', function () {
    feedback.info('Releasing build...');
  })
  .on('pushed', function () {
    feedback.success('Done!');
  })
  .on('error', function (err) {
    feedback.error(err);
  });