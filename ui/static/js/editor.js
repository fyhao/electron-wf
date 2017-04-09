angular.module('ui.editor', ['ngAnimate', 'ngSanitize', 'ui.bootstrap']);
angular.module('ui.editor').controller('EditorCtrl', function ($scope) {
  // In renderer process (web page).
	const {ipcRenderer} = require('electron')
	// get config
	var config;
	$scope.dsList = [];
	ipcRenderer.on('cfg', (event, arg) => {
		config = arg;
		// parse ds list
		$scope.dsList = [];
		for(var key in config.db) {
			$scope.dsList.push(key);
		}
		$scope.$apply(); // run angular $apply because out of angular scope...
	})
	// db
	ipcRenderer.on('editDB', (event, arg) => {
		$scope.showEditDBForm = true;
		$scope.editDBForm = {
			dbname : arg.key,
			item : arg.item
		}
		$scope.$apply(); // run angular $apply because out of angular scope...
	})
	$scope.showEditDBForm = false;
	$scope.editDBForm = {}
	
	$scope.saveDBForm = function() {
		var item = $scope.editDBForm.item;
		ipcRenderer.send('saveEditDB', $scope.editDBForm);
		$scope.showEditDBForm = false;
	}
	
	// workflows
	
	ipcRenderer.on('editWorkFlow', (event, arg) => {
		$scope.showEditWFForm = true;
		$scope.editWFForm = {
			key : arg.key,
			item : arg.item
		}
		
		$scope.$apply(); // run angular $apply because out of angular scope...
	})
	$scope.showEditWFForm = false;
	$scope.saveWFForm = function() {
		var item = $scope.editWFForm.item;
		ipcRenderer.send('saveEditWF', $scope.editWFForm);
		$scope.showEditWFForm = false;
	}
	
	$scope.deleteRecordset = function(step,rs) {
		for(var i = 0; i < step.recordsets.length; i++) {
			if(step.recordsets[i] == rs) {
				step.recordsets.splice(i,1);
				return;
			}
		}
	}
	$scope.newRecordset = '';
	$scope.addRecordset = function(step) {
		$scope.deleteRecordset(step,step.newRecordset)
		step.recordsets.push(step.newRecordset);
		step.newRecordset = '';
	}
	$scope.deleteStep = function(step) {
		for(var i = 0; i < $scope.editWFForm.item.steps.length; i++) {
			if($scope.editWFForm.item.steps[i].id == step.id) {
				$scope.editWFForm.item.steps.splice(i,1);
				return;
			}
		}
	}
	
	$scope.addStep = function(step) {
		step.isAddStepForm = true;
		
	}
	$scope.saveAddStep = function(step) {
		step.isAddStepForm = false;
		var newStep = {type:step.newType};
		for(var i = 0; i < $scope.editWFForm.item.steps.length; i++) {
			if($scope.editWFForm.item.steps[i].id == step.id) {
				$scope.editWFForm.item.steps.splice(i+1,0,newStep);
				return;
			}
		}
	}
	
	$scope.moveStepDown = function(step) {
		for(var i = 0; i < $scope.editWFForm.item.steps.length; i++) {
			if($scope.editWFForm.item.steps[i].id == step.id) {
				var theStep = $scope.editWFForm.item.steps.splice(i, 1);
				$scope.editWFForm.item.steps.splice(i+1,0,theStep[0]);
				return;
			}
		}
	}
	
	$scope.moveStepUp = function(step) {
		for(var i = 0; i < $scope.editWFForm.item.steps.length; i++) {
			if($scope.editWFForm.item.steps[i].id == step.id && i > 0) {
				var theStep = $scope.editWFForm.item.steps.splice(i, 1);
				$scope.editWFForm.item.steps.splice(i-1,0,theStep[0]);
				return;
			}
		}
	}
	
	$scope.addYesInputVars = function(step) {
		step.yes_inputVars.push(step.yesInputVar);
		step.yesInputVar = '';
	}
	$scope.deleteYesInputVar = function(step,vars) {
		for(var i = 0; i < step.yes_inputVars.length; i++) {
			if(step.yes_inputVars[i] == vars) {
				step.yes_inputVars.splice(i,1);
				return;
			}
		}
	}
	$scope.addYesOutputVars = function(step) {
		step.yes_outputVars.push(step.yesOutputVar);
		step.yesOutputVar = '';
	}
	$scope.deleteYesOutputVar = function(step,vars) {
		for(var i = 0; i < step.yes_outputVars.length; i++) {
			if(step.yes_outputVars[i] == vars) {
				step.yes_outputVars.splice(i,1);
				return;
			}
		}
	}
	$scope.addNoInputVars = function(step) {
		step.no_inputVars.push(step.noInputVar);
		step.noInputVar = '';
	}
	$scope.deleteNoInputVar = function(step,vars) {
		for(var i = 0; i < step.no_inputVars.length; i++) {
			if(step.no_inputVars[i] == vars) {
				step.no_inputVars.splice(i,1);
				return;
			}
		}
	}
	$scope.addNoOutputVars = function(step) {
		step.no_outputVars.push(step.noOutputVar);
		step.noOutputVar = '';
	}
	$scope.deleteNoOutputVar = function(step,vars) {
		for(var i = 0; i < step.no_outputVars.length; i++) {
			if(step.no_outputVars[i] == vars) {
				step.no_outputVars.splice(i,1);
				return;
			}
		}
	}
	
	$scope.types = ['log','exec','setVar','incrementVar','replaceAll','if','testDataPrep','subflow','copyFile','createFolder','deleteFolder','deleteFile','openFileRead','openFileWrite','appendFileWrite','printlnFileWrite','closeFileWrite','openExcel','readExcelCell','writeExcelCell','saveExcel','runExcelCase','wsread','wsupdate','sql','xml','evaljs'];
});

