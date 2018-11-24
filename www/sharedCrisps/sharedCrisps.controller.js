angular
.module('sharedCrisps', [])
.controller('SharedCrispsController', SharedCrispsController)
.controller('PlaySharedCrispsController', PlaySharedCrispsController);

SharedCrispsController.$inject = ['$scope', '$rootScope', '$timeout', '$ionicPlatform', '$ionicHistory', 'UserService', 'ModalService', 'YoutubeService', 'VideoService', 'GlobalConstants'];

function SharedCrispsController($scope, $rootScope, $timeout, $ionicPlatform, $ionicHistory, UserService, ModalService, YoutubeService, VideoService, GlobalConstants) {
	var vm = this;

	vm.sharedCrispsAvailable = false;
	vm.msg = '';
	vm.sharedCrispsList = [];
	vm.sharedCrisps = [];
	vm.sharedCrispsVars = {
	  controls: 0,
      fs: 0,
      rel: 0,
      showinfo: 0
	};
	vm.sharedCrispsControls = {};
	
	function init() {
		ModalService.create(
			'sharedCrisps',
			'playSharedCrisps',
			{
				id : ModalService.generateId(), 
				scope : $scope,
				animation : 'slide-in-right',
				backdropClickToClose : false
			},
			$scope
		);
	}

	function viewEntered() {
        getSharedCrisps();
    }

	function getSharedCrisps() {
		if($rootScope.userSession) {
			UserService.getCrisps('shared')
			.then(getSharedCrispsSuccess)
			.catch(getSharedCrispsError);
		}
		else {
			vm.msg = "Log in to unlock your dashboard!!!";
		}
	}

	function getSharedCrispsSuccess(sharedCrisps) {
		vm.sharedCrispsList = sharedCrisps.data.reverse();
		console.log(JSON.stringify(vm.sharedCrispsList));
		if(vm.sharedCrispsList.length) {
		    
		    vm.sharedCrispsAvailable = true;
			var sharedCrispsIds = '';
            for(var i = vm.sharedCrispsList.length - 1 ; i >= 0  ; i--) {
              sharedCrispsIds += vm.sharedCrispsList[i].videoId;
              if(i !== 0)
                sharedCrispsIds += ',';
            }
            var getSharedCrispsParams = {
				id : sharedCrispsIds,
				key : GlobalConstants.YoutubeAPIKey,
				part : "id, snippet, contentDetails"
			};
			YoutubeService.videos(getSharedCrispsParams)
	        .then(YoutubeServiceVideosSuccess)
	        .catch(YoutubeServiceVideosError);

		}
		else {
		    vm.msg = "No video highlights available!!!";
		}
	}

	function YoutubeServiceVideosSuccess(sharedCrisps) {
  		var i = sharedCrisps.data.items.length - 1;
  		angular.forEach(sharedCrisps.data.items, function(sharedCrisp){
  			sharedCrisp.contentDetails.duration = VideoService.parseDuration(sharedCrisp.contentDetails.duration);
  			vm.sharedCrispsList[i--].youtube = sharedCrisp;
        });
		console.log(JSON.stringify(vm.sharedCrispsList)); 
	}

	function YoutubeServiceVideosError(err) {
		console.log(JSON.stringify(err));
	}

	function getSharedCrispsError(err) {
		console.log(JSON.stringify(err));
	}

	$scope.$on( "$ionicView.enter", viewEntered);

	angular.extend(vm, {
		playSharedCrisps : playSharedCrisps,
		deleteSharedCrisp : deleteSharedCrisp
	});

	function playSharedCrisps(videoId, sharedCrisps, duration, picUrl){
		$timeout(function () {
        	vm.currentCrisp = {
				crisps : sharedCrisps,
				videoId : videoId,
				duration : duration,
				picUrl : picUrl
			};
      	}, 0);
		screen.orientation.lock('landscape');
	    ModalService.open($scope, 'playSharedCrisps');
	}

	function deleteSharedCrisp(videoId, index) {
		vm.deleteIndex = index;
		console.log('deleteSharedCrisp', videoId);
		UserService.deleteCrisp(
			videoId,
			'shared'
		)
		.then(deleteSharedCrispSuccess)
		.catch(deleteSharedCrispError);
	}

	function deleteSharedCrispSuccess(data) {
		console.log(JSON.stringify(data));
		vm.sharedCrispsList.splice(vm.deleteIndex, 1);
	}

	function deleteSharedCrispError(err) {
		console.log(JSON.stringify(err));
	}

	vm.$onInit = init();

	$ionicPlatform.registerBackButtonAction(customBackButton, 600);

	function customBackButton() {
	    console.log("insideback", $scope['playSharedCrisps']);
	    if($scope['playSharedCrisps']._isShown){
	    	console.log('insideif');
	    	vm.sharedCrispsControls.close();
	    }
	    else if($ionicHistory.backView()){
	        console.log("else if part");
	    	$ionicHistory.goBack();
	    }
	    else{
	    	console.log("else part");
	      	ionic.Platform.exitApp();
	    }
	}

}

PlaySharedCrispsController.$inject = ['$scope', '$rootScope', '$interval', '$state', 'CommonService', 'PlayCrispsService', 'PopupService', 'ModalService'];

function PlaySharedCrispsController($scope, $rootScope, $interval, $state, CommonService, PlayCrispsService, PopupService, ModalService){
	var vm = this;
	
	vm.isPlayerReady = false;
	vm.isPlayerPlaying = false;
	vm.player = null;
	vm.sharedCrispInterval = null;
	vm.confirmOptions = [
		{
			text : 'Replay',
			onTap : play
		},
		{
			text:'Full Video',
			onTap : fullVideo
		}
	];
	$scope.SharedCrispsCtrl.sharedCrispsControls = {
		close : close
	};

	angular.extend(vm, {
		//close : close
	});

	function onPlayerReady($event, player){
	 	vm.isPlayerReady = true;
		vm.player = player;
		play();	
	}

	function onPlayerPlaying(){
	}

	function play(){
		vm.player.seekTo($scope.SharedCrispsCtrl.currentCrisp.crisps[0]['start']);
		console.log(JSON.stringify($scope.SharedCrispsCtrl.currentCrisp.crisps));
 		vm.sharedCrispInterval = $interval(playCrisps, 200);
	}

	function playCrisps(){
		PlayCrispsService.playCrisps(
			vm.player,
			vm.sharedCrispInterval,
			$scope.SharedCrispsCtrl.currentCrisp,
			vm.confirmOptions
		);
	}

	$scope.$on('youtube.player.ready', onPlayerReady);

	$scope.$on('youtube.player.playing', onPlayerPlaying);

	function fullVideo(){
		ModalService.close($scope, 'playSharedCrisps');
		screen.orientation.unlock();
		$state.go(
			'app.homeView',
			{
				videoId : $scope.SharedCrispsCtrl.currentCrisp.videoId
			}
		)
		.then(function(success){
			$rootScope.$emit('catchCrisps', $scope.SharedCrispsCtrl.currentCrisp);
			reset();
		});
	}
	
	function close(){
		if(vm.player) {
			vm.player.pauseVideo();
		}
        CommonService.cancelInterval( vm.sharedCrispInterval );
        reset();
        ModalService.close($scope, 'playSharedCrisps');
        screen.orientation.unlock();
	}

	function reset() {
		// $scope.MyCrispsCtrl.currentCrisp.myCrispId = null;
		// $scope.MyCrispsCtrl.currentCrisp.myCrisps = [];
		// vm.currentCrisp = {};
		$scope.SharedCrispsCtrl.currentCrisp = {};
	}

}