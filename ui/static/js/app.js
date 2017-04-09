angular.module('ui.app', ['ngAnimate', 'ngSanitize', 'ui.bootstrap']);
angular.module('ui.app').controller('WFCtrl', function ($scope) {
  // In renderer process (web page).
	const {ipcRenderer} = require('electron')
	
	ipcRenderer.on('wfevt', (event, arg) => {
	  if(arg.action == 'startWorkflow') {
		   $scope.logs = [];
		   $scope.logs.push({log:'Execute workflow ' + arg.wfname});
	  }
	  else if(arg.action == 'log') {
	      var item = arg.item;
		  $scope.logs.push(item);
	  }
	  $scope.$apply(); // run angular $apply because out of angular scope...
	})
	$scope.logs = [];
});

