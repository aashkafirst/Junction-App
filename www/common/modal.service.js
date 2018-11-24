angular
.module('common')
.service('ModalService', ModalService);

ModalService.$inject = ['$ionicModal', '$parse'];

function ModalService($ionicModal, $parse) {

	angular.extend(this, {
		create : create,
		open : open,
		close : close,
		generateId : generateId,
		id : -1
	});

	function create( package, name, options, scope ) {
		$ionicModal.fromTemplateUrl(package + '/' + name + '.html', options)
		.then(function(modal) {
			$parse(name).assign(scope, modal);
			//$scope.crispsList = modal;
		});
	}

	function open(scope, modal) {
		scope[modal].show();
	}

	function close(scope, modal) {
		scope[modal].hide();
	}

	function generateId() {
		return ++(this.id);
	}

}