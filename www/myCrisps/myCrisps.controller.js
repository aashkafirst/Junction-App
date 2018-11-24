angular
.module('myCrisps', [])
.controller('MyCrispsController', MyCrispsController)
.controller('PlayMyCrispsController', PlayMyCrispsController);

MyCrispsController.$inject = ['$scope', '$rootScope', '$timeout', '$ionicPlatform', '$ionicHistory', 'UserService', 'ModalService', 'YoutubeService', 'VideoService', 'GlobalConstants'];

function MyCrispsController($scope, $rootScope, $timeout, $ionicPlatform, $ionicHistory, UserService, ModalService, YoutubeService, VideoService, GlobalConstants) {
	var vm = this;

	vm.myCrispsAvailable = false;
	vm.msg = '';
	vm.myCrispsList = [];
	vm.myCrisps = [];
	vm.myCrispsVars = {
	  controls: 0,
      fs: 0,
      rel: 0,
      showinfo: 0
	};
	vm.myCrispsControls = {};
	
	function init() {
		ModalService.create(
			'myCrisps',
			'playMyCrisps',
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
        getMyCrisps();
    }

	function getMyCrisps() {
		if($rootScope.userSession) {
			UserService.getCrisps('my')
			.then(getMyCrispsSuccess)
			.catch(getMyCrispsError);
		}
		else {
			vm.msg = "Log in to unlock your dashboard!!!";
		}
	}

	function getMyCrispsSuccess(myCrisps) {
		vm.myCrispsList = myCrisps.data.reverse();
		console.log(JSON.stringify(vm.myCrispsList));
		if(vm.myCrispsList.length) {
		    
		    vm.myCrispsAvailable = true;
			var myCrispsIds = '';
            for(var i = vm.myCrispsList.length - 1 ; i >= 0 ; i--) {
              myCrispsIds += vm.myCrispsList[i].videoId;
              if(i !== 0)
                myCrispsIds += ',';
            }
            var getMyCrispsParams = {
				id : myCrispsIds,
				key : GlobalConstants.YoutubeAPIKey,
				part : "id, snippet, contentDetails"
			};
			YoutubeService.videos(getMyCrispsParams)
	        .then(YoutubeServiceVideosSuccess)
	        .catch(YoutubeServiceVideosError);

		}
		else {
		    vm.msg = "No video highlights available!!!";
		}
	}

	function YoutubeServiceVideosSuccess(myCrisps) {
  		var i = myCrisps.data.items.length - 1;
  		angular.forEach(myCrisps.data.items, function(myCrisp){
  			myCrisp.contentDetails.duration = VideoService.parseDuration(myCrisp.contentDetails.duration);
  			vm.myCrispsList[i--].youtube = myCrisp;
        });
		console.log(JSON.stringify(vm.myCrispsList)); 
	}

	function YoutubeServiceVideosError(err) {
		console.log(JSON.stringify(err));
	}

	function getMyCrispsError(err) {
		console.log(JSON.stringify(err));
	}

	$scope.$on( "$ionicView.enter", viewEntered);

	angular.extend(vm, {
		playMyCrisps : playMyCrisps,
		deleteMyCrisp : deleteMyCrisp
	});

	function playMyCrisps(videoId, myCrisps, duration, picUrl){
		$timeout(function () {
        	vm.currentCrisp = {
				crisps : myCrisps,
				videoId : videoId,
				duration : duration,
				picUrl : picUrl
			};
      	}, 0);
		screen.orientation.lock('landscape');
	    ModalService.open($scope, 'playMyCrisps');
	}

	function deleteMyCrisp(videoId, index) {
		vm.deleteIndex = index;
		console.log('deleteMyCrisp', videoId);
		UserService.deleteCrisp(
			videoId,
			'my'
		)
		.then(deleteMyCrispSuccess)
		.catch(deleteMyCrispError);
	}

	function deleteMyCrispSuccess(data) {
		console.log(JSON.stringify(data));
		vm.myCrispsList.splice(vm.deleteIndex, 1);
	}

	function deleteMyCrispError(err) {
		console.log(JSON.stringify(err));
	}

	vm.$onInit = init();

	$ionicPlatform.registerBackButtonAction(customBackButton, 600);

	function customBackButton() {
	    console.log("insideback", $scope['playMyCrisps']._isShown);
	    if($scope['playMyCrisps']._isShown){
	    	console.log('insideif');
	    	vm.myCrispsControls.close();
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

PlayMyCrispsController.$inject = ['$scope', '$rootScope', '$interval', '$state', 'CommonService', 'PlayCrispsService', 'PopupService', 'ModalService'];

function PlayMyCrispsController($scope, $rootScope, $interval, $state, CommonService, PlayCrispsService, PopupService, ModalService){
	var vm = this;
	
	vm.isPlayerReady = false;
	vm.isPlayerPlaying = false;
	vm.player = null;
	vm.myCrispInterval = null;
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
	$scope.MyCrispsCtrl.myCrispsControls = {
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

	function play(){
		vm.player.seekTo($scope.MyCrispsCtrl.currentCrisp.crisps[0]['start']);
		console.log(JSON.stringify($scope.MyCrispsCtrl.currentCrisp.crisps));
 		vm.myCrispInterval = $interval(playCrisps, 200);
	}

	function playCrisps(){
		PlayCrispsService.playCrisps(
			vm.player,
			vm.myCrispInterval,
			$scope.MyCrispsCtrl.currentCrisp,
			vm.confirmOptions
		);
	}

	$scope.$on('youtube.player.ready', onPlayerReady);

	function fullVideo(){
		ModalService.close($scope, 'playMyCrisps');
		screen.orientation.unlock();
		$state.go(
			'app.homeView',
			{
				videoId : $scope.MyCrispsCtrl.currentCrisp.videoId
			}
		)
		.then(function(success){
			$rootScope.$emit('catchCrisps', $scope.MyCrispsCtrl.currentCrisp);
			reset();
		});
	}
	
	function close(){
		if(vm.player) {
			vm.player.pauseVideo();
		}
        CommonService.cancelInterval( vm.myCrispInterval );
        reset();
        ModalService.close($scope, 'playMyCrisps');
        screen.orientation.unlock();
	}

	function reset() {
		// $scope.MyCrispsCtrl.currentCrisp.myCrispId = null;
		// $scope.MyCrispsCtrl.currentCrisp.myCrisps = [];
		// vm.currentCrisp = {};
		$scope.MyCrispsCtrl.currentCrisp = {};
	}

}