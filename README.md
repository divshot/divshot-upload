# divshot-upload

Upload app files to Divshot

* [Install](#install)
* [Usage](#usage)
  * [Server](#server-or-browserify)
  * [Angular](#angular)
* [API](#api)
* [Run Tests](#run-tests)

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

```html
<script src="/bower_components/divshot-upload/dist/upload.directive.js"></script>
```

#### Inject into app

```js
angular.modules('myApp', ['divshot.upload']);
```

#### Use as directive

HTML

The `<ds-upload/>` element becomes a drag and drop zone OR you can click on it to upload a file

```html
<div ng-controller="AppController">
  <ds-upload class="divshot-upload"
    ds-config="appConfig"
    ds-environment="environment"
    ds-token="token"
    ds-enter="onEnter()"
    ds-leave="onLeave()"
    ds-drop="onDrop()"
    ds-progress="onProgress(type, message)"
    ds-done="onDone()"
    ds-start="onStart()"
    ds-unreleased="onUnreleased(files)"
    ds-error="onError(message)"
    ds-host="host">
    
    Drop Here or Click Here to Upload File
    
  </ds-upload>
</div>
```

Controller

```js
angular.modules('myApp')
  .controller('AppController', function ($scope) {
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
    $scope.onStart = function () {
      console.log('Upload started');
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

## API

### upload(options)

* **options**
  * `token` - user authentication token
  * `environment` - environment to push to
  * `type` - type of file to upload (**tar** or **zip** only for now)
  * `config` - application configuration (taken from the *divshot.json* file)
  * `host` - OPTIONAL - the divshot api endpoint (Used for dev, test, and production environments). Defaults to production api.
  
### Events

The upload stream emits the following events

* `message` - generic message from upload stream
  * callback should look like `function (message) {}`
* `releasing` - started the releasing stage of the push
  * callbacked should look like `function () {}`
* `released` - individual file has been released
  * callbacked should look like `function (file) {}`
* `pushed` - build has been fully pushed and deployed
  * callbacked should look like `function () {}`
* `unreleased` - only fired if there were unreleased files
  * calback should look like `function (unreleasedFiles) {}`
* `error` - an error occured in the process
  * callbacked should look like `function (err) {}`

## Run Tests

Runs server side tests and browser tests. Browser tests require that [Phantomjs](http://phantomjs.org) is installed

```
npm install
npm test
```