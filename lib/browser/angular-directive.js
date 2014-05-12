var upload = require('../../index.js');
var createReadStream = require('filereader-stream');
var drop = require('drag-and-drop-files');

angular.module('divshot.upload', [])
  .directive('dsUpload', function () {
    return {
      restrict: 'E',
      replace: true,
      transclude: true,
      scope: {
        dsType: '=',
        dsConfig: '=',
        dsEnvironment: '=',
        dsToken: '=',
        dsClientId: '=',
        dsHost: '=',
        dsEnter: '&',
        dsLeave: '&',
        dsDrop: '&',
        dsProgress: '&',
        dsDone: '&',
        dsBegin: '&',
        dsError: '&'
      },
      
      template: [
        '<div>',
          '<form>',
            '<input type="file" class="divshot-upload-input" multiple="false" accept="application/zip"/>',
          '</form>',
          '<div ng-transclude></div>',
          '<div class="ds-dropzone"></div>',
        '</div>'
      ].join('\n'),
      
      controller: function ($scope) {
        $scope.uploadOptions = {
          type: $scope.dsType || 'zip',
          token: $scope.dsToken,
          client_id: $scope.dsClientId,
          environment: $scope.dsEnvironment,
          config: $scope.dsConfig
        };
        
        // Optional host
        if ($scope.dsHost) $scope.uploadOptions.host = $scope.dsHost;
        
        $scope.sendProgress = function (type) {
          return function (message) {
            $scope.dsProgress({
              type: type,
              message: message || ''
            });
            $scope.$apply();
          };
        };
        
        $scope.sendDone = function () {
          $scope.dsDone();
          $scope.$apply();
        };
        
        $scope.sendError = function (message) {
          $scope.dsError({message: message});
          $scope.$apply();
        };
        
        $scope.sendUnreleased = function (files) {
          $scope.dsUnreleased({files: files});
          $scope.$apply();
        };
        
        $scope.sendBegin = function (file) {
          $scope.dsBegin({file: file});
          $scope.$apply();
        };
      },
      
      link: function (scope, element, attrs) {
        var form = element[0].querySelector('form');
        var dropzone = element[0].querySelector('.ds-dropzone');
        var fileInput = element[0].querySelector('.divshot-upload-input');
        
        // Setup
        dropzone.addEventListener('dragenter', formDragEnter, false);
        dropzone.addEventListener('dragleave', formDragLeave, false);
        dropzone.addEventListener('click', triggerFileChooser);
        form.addEventListener('change', triggerUpload);
        drop(element[0], formDrop);
        
        styleElements();
        
        //
        function startUpload (file) {
          scope.sendBegin(file);
          
          createReadStream(file).pipe(upload(scope.uploadOptions))
            .on('message', scope.sendProgress('message'))
            .on('released', scope.sendProgress('released'))
            .on('releasing', scope.sendProgress('releasing'))
            .on('loading', scope.sendProgress('loading'))
            .on('pushed', scope.sendDone)
            .on('unreleased', scope.sendUnreleased)
            .on('error', scope.sendError);
        }
        
        function triggerUpload (e) {
          var files = e.target.files;
          startUpload(files[0]);
        };
        
        function formDrop (files) {
          element.removeClass('enter');
          element.removeClass('leave');
          scope.dsDrop({});
          startUpload(files[0]);
        };
        
        function formDragEnter (e) {
          e.preventDefault();
          element.removeClass('leave');
          element.addClass('enter');
          scope.dsEnter({});
        };
        
        function formDragLeave (e) {
          e.preventDefault();
          element.removeClass('enter');
          element.addClass('leave');
          scope.dsLeave({});
        };
        
        function triggerFileChooser (e) {
          e.preventDefault();
          fileInput.click();
        };
        
        function styleElements () {
          element.css({
            position: 'relative'
          });
          
          angular.element(form).css({
            display: 'none'
          });
          
          angular.element(dropzone).css({
            cursor: 'pointer',
            height: '100%',
            left: 0,
            position: 'absolute',
            top: 0,
            width: '100%'
          });
        }
      }
    };
  })