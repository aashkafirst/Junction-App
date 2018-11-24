angular
.module('home', [])
.controller('HomeController', HomeController)
.controller('SharedWithUController', SharedWithUController)
.controller('SopController', SopController);

HomeController.$inject = ['$scope', '$timeout', '$rootScope', '$ionicPlatform', '$ionicHistory', 'GlobalConstants', 'YoutubeService', 'VideoService', 'ModalService', 'CommonService'];

function HomeController($scope, $timeout, $rootScope, $ionicPlatform, $ionicHistory, GlobalConstants, YoutubeService, VideoService, ModalService, CommonService) {
	var vm = this;

	vm.videos = [];
	vm.sharedWithUCrisp = {};
	vm.sharedWithUVars = {};
	vm.sop = {};
	vm.sopVars = {};
	vm.sharedWithU = {};
	vm.sopControls = {};

	function init(){

		vm.searchVideoIds = '_uSlP91jmTM,5u4G23_OohI,KkMDCCdjyW8,qg_M37WGKG8,xbYgKoG4x2g,Up6KLx3m2ww,S-T2-ir6TPA'

		var getVideosParams = {
			id : vm.searchVideoIds,
			key : GlobalConstants.YoutubeAPIKey,
			part : "id, snippet, contentDetails"
		};

		YoutubeService.videos(getVideosParams)
		.then(YoutubeServiceVideosSuccess)
		.catch(YoutubeServiceVideosError);

		// var getVideosParams = {
		// 	key : GlobalConstants.YoutubeAPIKey,
	 //        part : "id, snippet, contentDetails",
		//     chart : "mostPopular",
		//     regionCode : "IN",
		//     maxResults : 50
		// }
		// YoutubeService.videos(getVideosParams)
		// .then(YoutubeServiceVideosSuccess)
		// .catch(YoutubeServiceVideosError);

		ModalService.create(
			'home',
			'sharedWithU',
			{
				id : ModalService.generateId(), 
				scope : $scope,
				animation : 'slide-in-right',
				backdropClickToClose : false
			},
			$scope
		);

		ModalService.create(
			'home',
			'sop',
			{
				id : ModalService.generateId(), 
				scope : $scope,
				animation : 'slide-in-right',
				backdropClickToClose : false
			},
			$scope
		);
	}

	function YoutubeServiceVideosSuccess(videoList){
		var i = 0;
		angular.forEach( videoList.data.items, function(videoListItem){
			videoListItem.contentDetails.duration = VideoService.parseDuration( videoListItem.contentDetails.duration );
			vm.videos.push(videoListItem);
		});
	}

	function YoutubeServiceVideosError(err){
		console.log("error", JSON.stringify(err));
	}

	// function YoutubeServiceVideosSuccess(videoList){
	// 	console.log(videoList);
	// 	angular.forEach( videoList.data.items, function(videoListItem){
	// 		videoListItem.contentDetails.duration = VideoService.parseDuration( videoListItem.contentDetails.duration );
	// 		vm.videos.push(videoListItem);
	// 	});
	// }

	// function YoutubeServiceVideosError(err){
	// 	console.log("error", JSON.stringify(err));
	// }

	function catchSharedWithU(event, linkData) {
		$timeout(function () {
	         vm.sharedWithUVars =
	         {
				controls : 0,
				rel : 0,
				showinfo: 0
			};
			vm.sharedWithUCrisp = {
				videoId : linkData.videoId,
				crisps : JSON.parse(linkData.crisps.replace(/\\/g, '')),
				duration : linkData.duration,
				picUrl : linkData.$og_image_url
			};
			console.log(JSON.stringify(vm.sharedWithUCrisp));
			screen.orientation.lock('landscape');
			ModalService.open($scope, 'sharedWithU');
        }, 0);
	}

	$rootScope.$on('catchSharedWithU', catchSharedWithU);

	angular.extend(vm, {
		getVideoPicUrl : getVideoPicUrl,
		getSop : getSop,
		loadMoreVideos : loadMoreVideos
	});

	function getVideoPicUrl(picUrl) {
		VideoService.setPicUrl(picUrl);
	}

	function getSop(videoId) {
		console.log("home");	
		CommonService.getSop({ 
			videoId : videoId,
			jwtToken : localStorage.getItem('jwtToken')
		})
		.then(getSopSuccess)
		.catch(getSopError);
	}

	function getSopSuccess(sop) {
		console.log(JSON.stringify(sop));
		$timeout(function () {
	        vm.sopVars = {
				controls : 0,
				rel : 0,
				showinfo : 0
			};
			vm.sop = {
				videoId : sop.data.videoId,
				crisps : sop.data.crisps,
				duration : sop.data.duration
			};
			console.log(JSON.stringify(vm.sop.crisps));
			screen.orientation.lock('landscape');
			ModalService.open($scope, 'sop');
        }, 0);
	}

	function getSopError(err) {
		console.log(JSON.stringify(err));
	}

	function loadMoreVideos(){
		var temp = vm.videos;
		vm.videos = (vm.videos).concat(temp);
		$scope.$broadcast('scroll.infiniteScrollComplete');
	}

	vm.$onInit = init();

	$ionicPlatform.registerBackButtonAction(customBackButton, 600);

	function customBackButton() {
	    console.log("insideback", $scope['sharedWithU']._isShown, $scope['sop']._isShown);
	    if($scope['sharedWithU']._isShown){
	    	console.log('insideif');
	    	vm.sharedWithU.close();
	    }
	    else if($scope['sop']._isShown){
	        console.log("modal else if part");
	    	vm.sopControls.close();
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

SharedWithUController.$inject = ['$scope', '$rootScope', '$interval', '$state', 'CommonService', 'PlayCrispsService', 'PopupService', 'ModalService'];

function SharedWithUController($scope, $rootScope, $interval, $state, CommonService, PlayCrispsService, PopupService, ModalService){
	
	var vm = this;
	
	vm.isPlayerReady = false;
	vm.isPlayerPlaying = false;
	vm.player = null;
	vm.sharedWithUCrispInterval = null;
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
	$scope.HomeCtrl.sharedWithU = {
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
		vm.player.seekTo($scope.HomeCtrl.sharedWithUCrisp.crisps[0]['start']);
		console.log(JSON.stringify($scope.HomeCtrl.sharedWithUCrisp.crisps));
 		vm.sharedWithUCrispInterval = $interval(playCrisps, 200);
	}

	function playCrisps(){
		PlayCrispsService.playCrisps(
			vm.player,
			vm.sharedWithUCrispInterval,
			$scope.HomeCtrl.sharedWithUCrisp,
			vm.confirmOptions
		);
	}

	$scope.$on('youtube.player.ready', onPlayerReady);

	function fullVideo(){
		ModalService.close($scope, 'sharedWithU');
		screen.orientation.unlock();
		$state.go(
			'app.homeView',
			{
				videoId : $scope.HomeCtrl.sharedWithUCrisp.videoId
			}
		)
		.then(function(success){
			$rootScope.$emit('catchCrisps', $scope.HomeCtrl.sharedWithUCrisp);
			reset();
		});
	}
	
	function close(){
		if(vm.player) {
			vm.player.pauseVideo();
		}
	    CommonService.cancelInterval( vm.sharedWithUCrispInterval );
	    reset();
	    ModalService.close($scope, 'sharedWithU');
	    screen.orientation.unlock();
	}

	function reset() {
		// $scope.MyCrispsCtrl.sharedWithUCrisp.myCrispId = null;
		// $scope.MyCrispsCtrl.sharedWithUCrisp.myCrisps = [];
		// vm.sharedWithUCrisp = {};
		$scope.HomeCtrl.sharedWithUCrisp = {};
	}
}

SopController.$inject = ['$scope', '$rootScope', '$interval', '$state', 'CommonService', 'PlayCrispsService', 'PopupService', 'ModalService'];

function SopController($scope, $rootScope, $interval, $state, CommonService, PlayCrispsService, PopupService, ModalService){

	var vm = this;
	
	vm.isPlayerReady = false;
	vm.isPlayerPlaying = false;
	vm.player = null;
	vm.sopInterval = null;
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
	$scope.HomeCtrl.sopControls = {
		close : close
	}

	angular.extend(vm, {
		//close : close
	});

	function onPlayerReady($event, player){
	 	vm.isPlayerReady = true;
		vm.player = player;
		play();	
	}

	function play(){
		vm.player.seekTo($scope.HomeCtrl.sop.crisps[0]['start']);
		console.log(JSON.stringify($scope.HomeCtrl.sop.crisps));
 		vm.sopInterval = $interval(playCrisps, 200);
	}

	function playCrisps(){
		PlayCrispsService.playCrisps(
			vm.player,
			vm.sopInterval,
			$scope.HomeCtrl.sop,
			vm.confirmOptions
		);
	}

	$scope.$on('youtube.player.ready', onPlayerReady);

	function fullVideo(){
		ModalService.close($scope, 'sop');
		screen.orientation.unlock();
		$state.go(
			'app.homeView',
			{
				videoId : $scope.HomeCtrl.sop.videoId
			}
		)
		.then(function(success){
			reset();
		});
	}
	
	function close(){
		if(vm.player) {
			vm.player.pauseVideo();
		}
        CommonService.cancelInterval( vm.sopInterval );
        reset();
        ModalService.close($scope, 'sop');
        screen.orientation.unlock();
	}

	function reset() {
		// $scope.MyCrispsCtrl.sharedWithUCrisp.myCrispId = null;
		// $scope.MyCrispsCtrl.sharedWithUCrisp.myCrisps = [];
		// vm.sharedWithUCrisp = {};
		$scope.HomeCtrl.sop = {};
	}
}