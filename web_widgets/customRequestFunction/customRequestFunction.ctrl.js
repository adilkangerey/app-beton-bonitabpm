function PbButtonCtrl($scope, $http, $location, $log, $window, localStorageService, modalService) {

  'use strict';

  var vm = this;

  this.action = function action() {
   if($scope.properties.url) {
       //$scope.properties.fn($scope.properties.variable1);
      doRequest($scope.properties.action, $scope.properties.url);
    }
  };
  
  
  function closeModal(shouldClose) {
    if(shouldClose)
    {modalService.close();}
  }

  /**
   * Execute a get/post request to an URL
   * It also bind custom data from success|error to a data
   * @return {void}
   */
  function doRequest(method, url, params) {
    vm.busy = true;
    var req = {
      method: method,
      url: url,
      data: angular.copy($scope.properties.dataToSend),
      params: params
    };

    return $http(req)
      .success(function(data, status) {
        $scope.properties.dataFromSuccess = data;
        $scope.properties.responseStatusCode = status;
        $scope.properties.dataFromError = undefined;
        notifyParentFrame({ message: 'success', status: status, dataFromSuccess: data, dataFromError: undefined, responseStatusCode: status});
        if ($scope.properties.targetUrlOnSuccess && method !== 'GET') {
          redirectIfNeeded();
        }
        closeModal($scope.properties.closeOnSuccess);
      })
      .error(function(data, status) {
        $scope.properties.dataFromError = data;
        $scope.properties.responseStatusCode = status;
        $scope.properties.dataFromSuccess = undefined;
        notifyParentFrame({ message: 'error', status: status, dataFromError: data, dataFromSuccess: undefined, responseStatusCode: status});
      })
      .finally(function() {
        vm.busy = false;
      });
  }

  function redirectIfNeeded() {
    var iframeId = $window.frameElement ? $window.frameElement.id : null;
    //Redirect only if we are not in the portal or a living app
    if (!iframeId || iframeId && iframeId.indexOf('bonitaframe') !== 0) {
      $window.location.assign($scope.properties.targetUrlOnSuccess);
    }
  }

  function notifyParentFrame(additionalProperties) {
    if ($window.parent !== $window.self) {
      var dataToSend = angular.extend({}, $scope.properties, additionalProperties);
      $window.parent.postMessage(JSON.stringify(dataToSend), '*');
    }
  }

  function getUserParam() {
    var userId = getUrlParam('user');
    if (userId) {
      return { 'user': userId };
    }
    return {};
  }

  /**
   * Extract the param value from a URL query
   * e.g. if param = "id", it extracts the id value in the following cases:
   *  1. http://localhost/bonita/portal/resource/process/ProcName/1.0/content/?id=8880000
   *  2. http://localhost/bonita/portal/resource/process/ProcName/1.0/content/?param=value&id=8880000&locale=en
   *  3. http://localhost/bonita/portal/resource/process/ProcName/1.0/content/?param=value&id=8880000&locale=en#hash=value
   * @returns {id}
   */
  function getUrlParam(param) {
    var paramValue = $location.absUrl().match('[//?&]' + param + '=([^&#]*)($|[&#])');
    if (paramValue) {
      return paramValue[1];
    }
    return '';
  }

}
