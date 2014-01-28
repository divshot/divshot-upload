var upload = require('../../index.js');
var element = require('tiny-element');
var createReadStream = require('filereader-stream');

element('.fileToUpload').addEventListener('change', function (e) {
  var file = e.target.files[0];
  var tarOptions = {
    type: 'tar',
    token: 'ynnwS3hTA51wDQhOtr-Q3xDysa0K8Q47X_7DHX6u',
    // token: 'wpFBl-LtGBLm_oBx3dY_g6WRPg1jSCrIykvGHPam',
    environment: 'production',
    config: {
      name: 'uploadapp',
      clean_urls: true
    },
    host: 'http://api.dev.divshot.com:9393'
  };
  var zipOptions = {
    type: 'zip',
    token: 'ynnwS3hTA51wDQhOtr-Q3xDysa0K8Q47X_7DHX6u',
    // token: 'wpFBl-LtGBLm_oBx3dY_g6WRPg1jSCrIykvGHPam',
    environment: 'production',
    config: {
      name: 'uploadapp',
      clean_urls: true
    },
    host: 'http://api.dev.divshot.com:9393'
  };
  
  createReadStream(file).pipe(upload(zipOptions))
    .on('message', console.log.bind(console))
    .on('released', function (msg) {
      console.log('Deployed ' + msg);
    })
    .on('releasing', function () {
      console.log('Releasing build...');
    })
    .on('loading', function () {
      console.log('.'); // TODO: implement this
    })
    .on('pushed', function () {
      console.log('Application deployed to ' + 'production');
      console.log('You can view your app at: ' + 'http://' + 'production' + '.' + 'uploadapp' + '.divshot.io');
    })
    .on('unreleased', function (unreleasedFiles) {
      console.error('Not all files released.');
      
      Object.keys(unreleasedFiles).forEach(function (filename) {
        console.error(filename + ' unreleased');
      });
    })
    .on('error', function (err) {
      console.log('ERROR:', err);
    });
});
