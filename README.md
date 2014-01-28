# dio-upload

Upload app files to Divshot

## Install

### Server and Browserify

```
npm install divshot-upload --save
```

### Browser/Angular

```
bower install divshot-upload --save
```

## Usage

### Server or Browserify

```js
var fs = require('fs');
var upload = require('divshot-upload');
var fileStream = fs.creatReadStream('some-file.tar');
var uploadOptions = {
  token: 'user-token',
  environment: 'production',
  type: 'tar',
  config: {
    name: 'uploadapp',
    root: './'
  }
};

fileStream
  .pipe(upload(uploadOptions))
  .on('message', function (msg) {})
  .on('released', function (filepath) {})
  .on('releasing', function () {})
  .on('pushed', function () {})
  .on('unreleased', function (unreleasedFiles) {})
  .on('error', function (err) {});
```

### Angular

**Inject into app**

```js
angular.modules('myApp', ['divshot.upload']);
```

**Use as directive**

HTML

```html
<ds-upload class="divshot-upload"
  ds-config="appConfig"
  ds-environment="environment"
  ds-token="token"
  ds-enter="onEnter()"
  ds-leave="onLeave()"
  ds-drop="onDrop()"
  ds-progress="onProgress(type, message)"
  ds-done="onDone()"
  ds-unreleased = "onUnreleased(files)"
  ds-error="onError(message)"
  ds-host="host">
  
  Drop Here or Click Here to Upload File
  
</ds-upload>
```

Controller

```js
angular.modules('myApp')
  .controller('AppController', function ($scope) {
    $scope.divshot = 'Upload';
    $scope.environment = 'production';
    $scope.token = 'some-user-token';
    $scope.host = 'http://dev.host'; // OPTIONAL
    $scope.appConfig = {
      name: 'uploadapp',
      clean_urls: true
    };
    
    $scope.onEnter = function () {
      console.log('enter');
    };
    $scope.onLeave = function () {
      console.log('leave');
    };
    $scope.onDrop = function () {
      console.log('drop');
    };
    $scope.onProgress = function (type, message) {
      console.log(type + ':', message);
    };
    $scope.onDone = function () {
      console.log('Application deployed!');
    };
    $scope.onUnreleased = function (files) {
      console.error('Not all files released.');
      
      Object.keys(files).forEach(function (filename) {
        console.error(filename + ' unreleased');
      });
    };
    $scope.onError = function (message) {
      console.error('ERROR:', message);
    };
  });
```

## Run Tests

Runs server side tests and browser tests. Browser tests require that [Phantomjs](http://phantomjs.org) is installed

```
npm install
npm test
```