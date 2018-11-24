angular
.module('video', ['youtube-embed', 'rzModule', 'ngCordova'])
.controller('VideoController', VideoController)
.controller('RelatedVideosController', RelatedVideosController)
.controller('CrispsListController', CrispsListController)
.controller('FullScreenController', FullScreenController);

VideoController.$inject = ['$scope', '$rootScope', '$stateParams', '$interval', '$timeout', '$ionicPlatform', '$ionicHistory', '$ionicModal', '$cordovaToast', 'CommonService', 'VideoService', 'PopupService', 'PlayCrispsService', 'UserService', 'ShareService', 'CommonService', 'ModalService', 'GlobalConstants'];

function VideoController($scope, $rootScope, $stateParams, $interval, $timeout, $ionicPlatform, $ionicHistory, $ionicModal, $cordovaToast, CommonService, VideoService, PopupService, PlayCrispsService, UserService, ShareService, CommonService, ModalService, GlobalConstants) {
	var vm = this;

	vm.videoId = $stateParams.videoId;
	vm.videoVars = {
		controls : 0,
		rel : 0,
		showinfo: 0
	};
	vm.progressBar = {
		value : 0,
		options : {
			id : "progressBar" + $ionicHistory.currentView().viewId,
			floor : 0,
			ceil : 100,
			hidePointerLabels : true,
			hideLimitLabels : true,
			onChange : onProgressBarChange
		}	
	};
	vm.progressBarInterval = null;
	vm.currentProgressBar = '';
	vm.player = null;
	vm.hasCrispStarted = false;
	vm.crispInterval = null;
	vm.currentCrispInterval = null;
	vm.crisp = {
		css : {}
	};
	vm.crisps = [];
	vm.displayCrisps = [];
	vm.currentCrisp = [];
	vm.overlaps = [];
	vm.relatedVideos = [];
	vm.isPaused = false;
	vm.isPlayerReady = false;
	vm.gotRelatedVideos = false;
	vm.canLoadFullScreen = false;
	vm.fullScreen = null;
	vm.confirmOptions = [
		{
			text : 'Yes',
			onTap : confirmYes
		},
		{
			text : 'No',
			onTap : confirmNo
		}
	];
	vm.seekNumber = 5;

	function init() {
		console.log("init");
		vm.currentView = 'normal';
		ModalService.create(
			'video',
			'crispsList',
			{
				id : ModalService.generateId(), 
				scope : $scope,
				animation : 'slide-in-right',
				backdropClickToClose : false
			},
			$scope
		);
		ModalService.create(
			'video',
			'fullScreen',
			{
				id : ModalService.generateId(), 
				scope : $scope,
				animation : 'slide-in-right'
			},
			$scope
		);
	}

	function onProgressBarChange() {
		VideoService.onProgressBarChange(	
			vm.player,
			vm.progressBar.value,
			vm.progressBarInterval
		);
	}

	function updateProgressBar() {
		VideoService.updateProgressBar(
			vm.player,
			vm.progressBar
		);
	}

	function catchCrisps(event, data) {
    	console.log(JSON.stringify(data));
    	VideoService.setPicUrl(data.picUrl);
    	for( var i=0 ; i < data.crisps.length ; i++ ){
    		VideoService.pushCrisp(
				vm.crisps,
				data.crisps[i],
				'crisps'
			)
			data.crisps[i].css = {
				new : true,
				color : CommonService.colorGenerator(),
				left : vm.crisps[i].start * 100 / data.duration,
				width : (vm.crisps[i].end - vm.crisps[i].start) * 100 / data.duration
			};
			VideoService.pushCrisp(
				vm.displayCrisps,
				data.crisps[i],
				'displayCrisps'
			)
		}
		console.log(JSON.stringify(vm.crisps), JSON.stringify(vm.displayCrisps));
	}

	function onPlayerReady($event, player) {
		if(player.getIframe().getAttribute('player')=="videoPlayer"){
			vm.isPlayerReady = true;
			vm.player = player;
			vm.player.duration = VideoService.convertTimeToHMS( vm.player.getDuration() - 1 );
			vm.player.currentTime = VideoService.convertTimeToHMS( 0 );
			vm.getRelatedVideos();
			if(vm.crisps.length) {
				console.log('inside if');
				$timeout(function(){
					for(var i = 0 ; i < vm.displayCrisps.length ; i++){
						VideoService.createCrisp(
							vm.displayCrisps[i].css.left,
							vm.progressBar.options.id,
							vm.displayCrisps[i].css.color,
							vm.displayCrisps[i].css.width
						);
					}
				},0);
			}
		}
	}

	function onPlayerPlaying($event, player) {
		if(player.getIframe().getAttribute('player')=="videoPlayer"){
			vm.isPaused = false;
			vm.progressBarInterval = $interval(updateProgressBar, 100);
		}
	}

	function onPlayerBuffering($event, player) {
		if(player.getIframe().getAttribute('player')=="videoPlayer"){
			vm.isPaused = true;
			CommonService.cancelInterval( vm.progressBarInterval );
		}
	}

	function onPlayerPaused($event, player) {
		if(player.getIframe().getAttribute('player')=="videoPlayer"){
			vm.isPaused = true;
			CommonService.cancelInterval( vm.progressBarInterval );
		}
	}

	function onPlayerQueued($event, player) {
		if(player.getIframe().getAttribute('player')=="videoPlayer"){
			CommonService.cancelInterval( vm.progressBarInterval );
		}
	}

	function onPlayerEnded($event, player) {
		if(player.getIframe().getAttribute('player')=="videoPlayer"){
			vm.isPaused = true;
			CommonService.cancelInterval( vm.progressBarInterval );
		}
	}

	function onPlayerError($event, player) {
		if(player.getIframe().getAttribute('player')=="videoPlayer"){
			vm.isPaused = true;
			CommonService.cancelInterval( vm.progressBarInterval );
		}
	}

	function beforeLeave() {
    	//console.log("leave");
    	if(vm.player){
    	    vm.pauseVideo();
    	}
  	}

  	$rootScope.$on('catchCrisps', catchCrisps);

	$scope.$on('youtube.player.ready', onPlayerReady);

	$scope.$on('youtube.player.playing', onPlayerPlaying);

	$scope.$on('youtube.player.buffering', onPlayerBuffering);

	$scope.$on('youtube.player.paused', onPlayerPaused);

	$scope.$on('youtube.player.queued', onPlayerQueued);

	$scope.$on('youtube.player.ended', onPlayerEnded);

	$scope.$on('youtube.player.error', onPlayerError);

	$scope.$on('$ionicView.beforeLeave', beforeLeave);

	angular.extend(vm, {
		startCrisp : startCrisp,
		endCrisp : endCrisp,
		play : play,
		playVideo : playVideo,
		pauseVideo : pauseVideo,
		reverse : reverse,
		forward : forward,
		goFullScreen : goFullScreen,
		createConnectedCrisps : createConnectedCrisps,
		openModal : openModal,
		saveCrisps : saveCrisps,
		shareCrisps : shareCrisps
	});

	function openModal( modal ){
		ModalService.open($scope, modal);
	}

	function confirmYes(){
  		vm.overlaps = [];
  		vm.overlaps.push( vm.crisps.length - 1 );
  		console.log('overlaps',JSON.stringify(vm.overlaps));
  		if(vm.currentProgressBar.search('Fs') !== -1){
			VideoService.destroyCrisp(
				vm.overlaps,
				vm.currentProgressBar,
				vm.progressBar.options.id,
				vm.crisps,
				vm.displayCrisps
			);
  		}
  		else{
  			VideoService.destroyCrisp(
				vm.overlaps,
				vm.currentProgressBar,
				vm.fullScreen.progressBar.id,
				vm.crisps,
				vm.displayCrisps
			);
  		}
		console.log(JSON.stringify(vm.crisps));
	}

	function confirmNo(){
		if(vm.currentProgressBar.search('Fs') !== -1){
			VideoService.destroyCrisp(
				vm.overlaps,
				vm.currentProgressBar,
				vm.progressBar.options.id,
				vm.crisps,
				vm.displayCrisps
			);
  		}
  		else{
  			VideoService.destroyCrisp(
				vm.overlaps,
				vm.currentProgressBar,
				vm.fullScreen.progressBar.options.id,
				vm.crisps,
				vm.displayCrisps
			);
  		}
		console.log(vm.crisps.length, JSON.stringify(vm.crisps));
	}

	function startCrisp(progressBar) {
		vm.hasCrispStarted = true;
		vm.currentProgressBar = progressBar.options.id;
		vm.crisp.annotation = '';
		vm.crisp.start = progressBar.value * vm.player.getDuration() / 100;
		console.log(vm.crisp);
		vm.crisp.css = {
			color : CommonService.colorGenerator(),
			left : progressBar.value,
			new : true
		}
		console.log(vm.crisp);
		VideoService.createCrisp(
			progressBar.value,
			progressBar.options.id,
			vm.crisp.css.color,
			0
		);
		console.log(vm.crisp.css);
		vm.crispInterval = $interval(function(){
			expandCrisp( 
				progressBar.options.id,
				progressBar.value - vm.crisp.css.left,
				vm.crisp.css.color
			);
		}, 100);
	}

	function expandCrisp(id, width, color) {
		console.log('expandCrisp',id, width, color);
		vm.crisp.css.width = width;
		angular
			.element( document.querySelector( '#' + id + ' .c' + color ) )
			.css({
				"width" : width + "%"
			});
	}

	function endCrisp(value) {
		vm.hasCrispStarted = false;
		CommonService.cancelInterval( vm.crispInterval );
		vm.crisp.end = value * vm.player.getDuration() / 100;
		VideoService.pushCrisp( vm.crisps, vm.crisp, 'crisps' );
		VideoService.pushCrisp( vm.displayCrisps, vm.crisp, 'displayCrisps' );
		console.log('endCrisp', JSON.stringify(vm.crisps));
		vm.overlaps = VideoService.checkOverlap( vm.crisps );
		console.log('overlaps', JSON.stringify(vm.overlaps));
		if( vm.overlaps.length ) {
			var overlapConfirm = PopupService.confirm(
				'Oops, overlap!!!',
				'Do you want to keep the previous highlight(s)?',
				vm.confirmOptions
			);
		}
	}

	function play(index) {
		vm.currentCrisp = [];
		vm.currentCrisp.push(vm.crisps[index]);
		ModalService.close($scope, 'crispsList');
		if(vm.currentView === 'fullScreen') {
			vm.fullScreen.player.seekTo(vm.crisps[index].start);
			vm.fullScreen.playVideo();
		}
		else {
			vm.player.seekTo(vm.crisps[index].start);
			vm.playVideo();
		}
 		vm.currentCrispInterval = $interval(playCrisps, 200);
	}

	function playCrisps() {
		if(vm.currentView === 'fullScreen') {
			PlayCrispsService.playCrisps(
				vm.fullScreen.player,
				vm.currentCrispInterval,
				{
					crisps : vm.currentCrisp
				},
				null
			);
		}
		else {
			PlayCrispsService.playCrisps(
				vm.player,
				vm.currentCrispInterval,
				{
					crisps : vm.currentCrisp
				},
				null
			);	
		}
		//vm.currentCrisp = [];
	}

	function playVideo() {
		vm.isPaused = false;
		vm.player.playVideo();
	}

	function pauseVideo() {
		vm.isPaused = true;
		vm.player.pauseVideo();
	}

	function reverse(player) {
		if(vm.seekNumber !== undefined){
			if(player === 'normal'){
				vm.player.seekTo(vm.player.getCurrentTime() - vm.seekNumber);
			}
			else{
				vm.fullScreen.player.seekTo(vm.fullScreen.player.getCurrentTime() - vm.seekNumber);	
			}
		}
		else{
			alert('Accepted range [1,5]');
		}
	}

	function forward(player) {
		if(vm.seekNumber !== undefined){
			if(player === 'normal'){
				vm.player.seekTo(vm.player.getCurrentTime() + vm.seekNumber);
			}
			else{
				vm.fullScreen.player.seekTo(vm.fullScreen.player.getCurrentTime() + vm.seekNumber);	
			}
		}
		else{
			alert('Accepted range [1,5]');
		}
	}

	function goFullScreen(){
		if(vm.player){
			vm.pauseVideo();
		}
		$timeout(function (){
        	vm.fullScreenId = vm.videoId;
      	}, 0);
      	ModalService.open($scope, 'fullScreen');
      	screen.orientation.lock('landscape');
      	vm.currentView = 'fullScreen';
      	if(vm.fullScreen.player){
      		VideoService.updateConnectedProperty(
  				vm.fullScreen.player,
  				vm.fullScreen.progressBar,
  				vm.player.getCurrentTime()
      		);
      		vm.createConnectedCrisps(vm.fullScreen.progressBar.options.id);
      		vm.fullScreen.playVideo();
      	}
	}

	function createConnectedCrisps(progressBarId){
		console.log(vm.displayCrisps);
		for( var i=0 ; i < vm.displayCrisps.length ; i++ ){
			if(vm.displayCrisps[i].css.new){
				console.log('inside if');
				VideoService.createCrisp(
					vm.displayCrisps[i].css.left,
					progressBarId,
					vm.displayCrisps[i].css.color,
					vm.displayCrisps[i].css.width
				);
				vm.displayCrisps[i].css.new = false;	
			}
		}
	}

	function saveCrisps(){
		if($rootScope.userSession)
		{
			if(vm.crisps.length === 0)
			{
				var alertPopup = PopupService.alert(
 					'<img src="https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcRg5ktpVz8VFaoKZ6BZb5w-35LR3jkGZbyWiiIC81jOSfaprsmYtQ" width="100%" height="80%"></img>',
 					"you don't have any highlights to save!"
 				);
			}
			else
			{
				var video = [];

				video.push({
					"jwtToken" : localStorage.getItem('jwtToken'),
					"videoId" : vm.videoId,
					"duration" : vm.player.getDuration(),
					"highlights" : vm.crisps,
					"type" : "my"
				});

				UserService.sendCrisps(video)
				.then(sendCrispsSuccess)
				.catch(sendCrispsError);
			}
		}
		else
		{
			var alertPopup = PopupService.alert(
				'<img src="https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcRg5ktpVz8VFaoKZ6BZb5w-35LR3jkGZbyWiiIC81jOSfaprsmYtQ" width="100%" height="80%"></img>',
				'you need to login to save your highlights'
			);
		}
	}

	function sendCrispsSuccess(data) {
		
		$cordovaToast
	    .showWithOptions({
	    	message : 'Sop saved!',
	    	duration : 5000,
	    	position : 'center',
	    	styling : {
	    		backgroundColor : '#F13E00'
	    	}
	    });

	}

	function sendCrispsError(err) {
		
		$cordovaToast
	    .showWithOptions({
	    	message : 'Oops, error occurred!',
	    	duration : 5000,
	    	position : 'center',
	    	styling : {
	    		backgroundColor : 'red'
	    	}
	    });
	
	}

	function shareCrisps(){
		
		if($rootScope.userSession)
		{
			if(vm.crisps.length === 0)
			{
				var alertPopup = PopupService.alert(
					'<img src="https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcRg5ktpVz8VFaoKZ6BZb5w-35LR3jkGZbyWiiIC81jOSfaprsmYtQ" width="100%" height="80%"></img>',
					"you don't have any highlights to share!"
				);
			}
			else
			{
      
	    		vm.branchUniversalObj = null;
	    		ShareService.createBranchObject(
	    			VideoService.getPicUrl(),
	    			vm.videoId,
	    			vm.crisps,
	    			vm.player.getDuration()
	    		)
	    		.then(branchObjectSuccess)
		    	.catch(branchObjectError);

			}
		}
		else
		{
			var alertPopup = PopupService.alert(
 				'<img src="https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcRg5ktpVz8VFaoKZ6BZb5w-35LR3jkGZbyWiiIC81jOSfaprsmYtQ" width="100%" height="80%"></img>',
 				'you need to login to share your highlights'
			);
		}
	}

	function branchObjectSuccess(branchObj) {
		vm.branchUniversalObj = branchObj;
		console.log(JSON.stringify(branchObj));
		
		ShareService.createShortUrl(vm.branchUniversalObj)
		.then(shortUrlSuccess)
		.catch(shortUrlError);
	}

	function shortUrlSuccess(shortUrl) {
		window.plugins.socialsharing.share("Watch this video", null, null, JSON.stringify(shortUrl.url));
		var video = [];
		video.push({
			"jwtToken" : localStorage.getItem('jwtToken'),
			"videoId" : vm.videoId,
			"duration" : vm.player.getDuration(),
			"highlights" : vm.crisps,
			"type" : "shared"
		});
		UserService.sendCrisps(video)
		.then(sendCrispsSuccess)
		.catch(sendCrispsError);
}

	function shortUrlError(err){
		console.log(JSON.stringify(err));
	}

	function branchObjectError(err) {
		console.log('Error: ' + JSON.stringify(err));
	}

	vm.$onInit = init();

	$ionicPlatform.registerBackButtonAction(customBackButton, 600);

	function customBackButton() {
	    console.log("insideback", $scope['fullScreen']._isShown);
	    if($scope['fullScreen']._isShown){
	    	console.log('insideif');
	    	vm.fullScreen.close();
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

RelatedVideosController.$inject = ['$scope', 'GlobalConstants', 'YoutubeService', 'VideoService'];

function RelatedVideosController($scope, GlobalConstants, YoutubeService, VideoService){

	var vm = this;

	angular.extend(vm, {
		loadMoreVideos : loadMoreVideos,
		getVideoPicUrl : getVideoPicUrl
	});

	function loadMoreVideos(){
		var temp = $scope.VideoCtrl.relatedVideos;
		$scope.VideoCtrl.relatedVideos = ($scope.VideoCtrl.relatedVideos).concat(temp);
		$scope.$broadcast('scroll.infiniteScrollComplete');
	}

	function getVideoPicUrl(picUrl) {
		console.log('RelatedCtrl', picUrl);
		VideoService.setPicUrl(picUrl);
	}

	$scope.VideoCtrl.getRelatedVideos = function() {

		console.log($scope.VideoCtrl.videoId);
		
		var getSearchResultsParams = {
			key : GlobalConstants.YoutubeAPIKey,
			part :"snippet, id",
			type :"video",
			relatedToVideoId : $scope.VideoCtrl.videoId,
			maxResults : 50,
			order : "date",
			publishedAfter : "2015-01-01T00:00:00Z"
        };

        YoutubeService.search(getSearchResultsParams)
        .then(YoutubeServiceSearchSuccess)
        .catch(YoutubeServiceSearchError);

	};

	function YoutubeServiceSearchSuccess(searchList){
		vm.searchVideoIds = '';
		angular.forEach( searchList.data.items, function(searchListItem){
			vm.searchVideoIds = vm.searchVideoIds + searchListItem.id.videoId + ',';
			$scope.VideoCtrl.relatedVideos.push(searchListItem);
		});

		vm.searchVideoIds = vm.searchVideoIds.slice(0,-1);
		console.log(vm.searchVideoIds);

		var getVideosParams = {
			id : vm.searchVideoIds,
			key : GlobalConstants.YoutubeAPIKey,
			part : "contentDetails"
		};

		YoutubeService.videos(getVideosParams)
		.then(YoutubeServiceVideosSuccess)
		.catch(YoutubeServiceVideosError);
	}

	function YoutubeServiceVideosSuccess(videoList){
		var i = 0;
		angular.forEach( videoList.data.items, function(videoListItem){
			$scope.VideoCtrl.relatedVideos[i++].duration = VideoService.parseDuration( videoListItem.contentDetails.duration );
			$scope.VideoCtrl.gotRelatedVideos = true;
		});
		console.log($scope.VideoCtrl.relatedVideos[0]);
	}

	function YoutubeServiceVideosError(err){
		console.log("error", JSON.stringify(err));
	}

	function YoutubeServiceSearchError(err){
		console.log("error", JSON.stringify(err));
	}

}

CrispsListController.$inject = ['$scope', '$ionicSlideBoxDelegate', 'ModalService'];

function CrispsListController($scope, $ionicSlideBoxDelegate, ModalService){
	console.log("CrispsListController", $scope.VideoCtrl.crisps);
	var vm = this;
	
	//vm.crisps = $scope.VideoCtrl.crisps;

	angular.extend(vm, {
		close : close,
		previous : previous,
		next : next,
		slideChanged : slideChanged
	});

	function previous(){
		$ionicSlideBoxDelegate.previous();
	}

	function next(){
		$ionicSlideBoxDelegate.next();
	}

	function slideChanged(index){
		console.log(index);
		vm.slideIndex = index;
	}

	function close(){
		ModalService.close($scope, 'crispsList');
		if($scope.VideoCtrl.currentView === 'fullScreen') {
			$scope.VideoCtrl.fullScreen.playVideo();
		}
		else{
			$scope.VideoCtrl.playVideo();
		}
	}
}

FullScreenController.$inject = ['$scope', '$interval', '$window', '$ionicHistory', '$timeout', '$ionicBackdrop', 'CommonService', 'VideoService', 'ModalService'];

function FullScreenController($scope, $interval, $window, $ionicHistory, $timeout, $ionicBackdrop, CommonService, VideoService, ModalService){

	var vm = this;

	vm.isPlayerReady = false;
	vm.isPaused = false;
	vm.modalWidth = $window.innerHeight;
	vm.modalHeight = $window.innerWidth;
	$scope.VideoCtrl.fullScreen = {
		progressBar : {
			value : 0,
			options : {
				id : "progressBarFs" + $ionicHistory.currentView().viewId,
				floor : 0,
				ceil : 100,
				hidePointerLabels : true,
				hideLimitLabels : true,
				onChange : onProgressBarChange
			}	
		},
		progressBarInterval : null,
		player : null,
		playVideo : playVideo,
		pauseVideo : pauseVideo,
		isPaused : false,
		close : close
	};

	function onProgressBarChange(){
		VideoService.onProgressBarChange(	
			$scope.VideoCtrl.fullScreen.player, 
			$scope.VideoCtrl.fullScreen.progressBar.value,
			$scope.VideoCtrl.fullScreen.progressBarInterval
		);
	}

	function updateProgressBar(){
		VideoService.updateProgressBar(
			$scope.VideoCtrl.fullScreen.player,
			$scope.VideoCtrl.fullScreen.progressBar
		);
	}

	function onPlayerReady($event, player){
		vm.isPlayerReady = true;
		$scope.VideoCtrl.fullScreen.player = player;
		$scope.VideoCtrl.fullScreen.player.duration = VideoService.convertTimeToHMS( $scope.VideoCtrl.fullScreen.player.getDuration() - 1 );
		VideoService.updateConnectedProperty(
			$scope.VideoCtrl.fullScreen.player,
			$scope.VideoCtrl.fullScreen.progressBar,
			$scope.VideoCtrl.player.getCurrentTime()
		);
		$timeout(function () {
        	$scope.VideoCtrl.createConnectedCrisps($scope.VideoCtrl.fullScreen.progressBar.options.id);
      	}, 0);
	}

	function onPlayerPlaying($event, player) {
		$scope.VideoCtrl.fullScreen.isPaused = false;
		vm.progressBarInterval = $interval(updateProgressBar, 100);
	}

	function onPlayerBuffering($event, player) {
		$scope.VideoCtrl.fullScreen.isPaused = true;
		CommonService.cancelInterval( vm.progressBarInterval );
	}

	function onPlayerPaused($event, player) {
		$scope.VideoCtrl.fullScreen.isPaused = true;
		CommonService.cancelInterval( vm.progressBarInterval );
	}

	function onPlayerQueued($event, player) {
		CommonService.cancelInterval( vm.progressBarInterval );
	}

	function onPlayerEnded($event, player) {
		$scope.VideoCtrl.fullScreen.isPaused = true;
		CommonService.cancelInterval( vm.progressBarInterval );
	}

	function onPlayerError($event, player) {
		$scope.VideoCtrl.fullScreen.isPaused = true;
		CommonService.cancelInterval( vm.progressBarInterval );
	}

	$scope.$on('youtube.player.ready', onPlayerReady);

	$scope.$on('youtube.player.playing', onPlayerPlaying);

	$scope.$on('youtube.player.buffering', onPlayerBuffering);

	$scope.$on('youtube.player.paused', onPlayerPaused);

	$scope.$on('youtube.player.queued', onPlayerQueued);

	$scope.$on('youtube.player.ended', onPlayerEnded);

	$scope.$on('youtube.player.error', onPlayerError);

	angular.extend(vm, {
		showCrispsList : showCrispsList
	});

	function showCrispsList() {
		angular.element(document.querySelectorAll('.crisps-list-modal'))
		.parent()
		.parent()
		.addClass("keep-above");
	}

	function playVideo() {
		$scope.VideoCtrl.fullScreen.isPaused = false;
		$scope.VideoCtrl.fullScreen.player.playVideo();
	}

	function pauseVideo() {
		$scope.VideoCtrl.fullScreen.isPaused = true;
		$scope.VideoCtrl.fullScreen.player.pauseVideo();
	}

	function close(){
		ModalService.close($scope, 'fullScreen');
		//$scope.VideoCtrl.closeModal('fullScreen');
		if($scope.VideoCtrl.fullScreen.player){
			$scope.VideoCtrl.fullScreen.pauseVideo();
		}
		screen.orientation.unlock();
		ModalService.close($scope, 'crispsList');
		//$scope.VideoCtrl.closeModal('crispsList');
		VideoService.updateConnectedProperty(
			$scope.VideoCtrl.player,
			$scope.VideoCtrl.progressBar,
			$scope.VideoCtrl.fullScreen.player.getCurrentTime()
		);
		$scope.VideoCtrl.createConnectedCrisps( $scope.VideoCtrl.progressBar.options.id );
		$scope.VideoCtrl.playVideo();
		$scope.VideoCtrl.currentView = 'normal';
	}

}