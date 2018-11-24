angular
.module('common')
.service('PopupService', PopupService);

PopupService.$inject = ['$ionicPopup', 'VideoService'];

function PopupService($ionicPopup, VideoService) {

	angular.extend(this, {
		confirm : confirm,
		alert : alert	
	});

	function confirm(title, subTitle, options){
		return $ionicPopup.show({
			title : title,
			subTitle : subTitle,
			buttons : [
			  { 
			  	text : options[0].text,
			  	onTap : options[0].onTap
			  },
			  {
				text : options[1].text,
				type : 'button-positive',
				onTap : options[1].onTap
			  }
			]
		});
	}

	function alert(title, template){
		return $ionicPopup.alert({
					title: title,
					template: template
				});
	}
}