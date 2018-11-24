angular
.module('common', [])
.controller('CommonController', CommonController);

CommonController.$inject = ['$scope', 'CommonConstants'];

function CommonController($scope, CommonConstants) {
	var vm = this;

	angular.extend(vm, {
		common: common
	});

	function common(){
		console.log("common");	
	}
}