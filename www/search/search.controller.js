angular
.module('search', ['angucomplete-alt'])
.controller('SearchController', SearchController)
.controller('SearchSopController', SearchSopController);

SearchController.$inject = ['$scope', '$ionicHistory', '$window', '$timeout', 'GlobalConstants', 'YoutubeService', 'VideoService', 'CommonService', 'ModalService'];

function SearchController($scope, $ionicHistory, $window, $timeout, GlobalConstants, YoutubeService, VideoService, CommonService, ModalService) {
	var vm = this;

	vm.searchResultsFound = false;
	vm.searched = false;
	vm.searchResults = [];
	vm.searchKey = '';
	vm.autoSearchResults = [];
	vm.selectedVideo = {};
	vm.searchFields = '';
	vm.sop = {};
	vm.sopVars = {};
	vm.sopControls = {};

	function init() {
		ModalService.create(
			'search',
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

	angular.extend(vm, {
		doSearch: doSearch,
		goBack : goBack,
		youtubeSearch : youtubeSearch,
		selected : selected,
		loadMoreVideos : loadMoreVideos,
		getVideoPicUrl : getVideoPicUrl,
		getSop : getSop
	});

	function doSearch(){
		//vm.searchKey = '';
		if(vm.searchKey === undefined || vm.searchKey === '')
		vm.searchKey=document.getElementById('searchInput_value').value;
		console.log(vm.searchKey);
		if( vm.searchKey !== undefined && vm.searchKey.length)
		{
			vm.searched = true;
			console.log('inside if');
			var getSearchResultsParams = {
				key : GlobalConstants.YoutubeAPIKey,
				part : "snippet, id",
				type : "video",
				q : encodeURIComponent(vm.searchKey).replace(/%20/g, "+"),
				maxResults : 50,
				order : "date",
				publishedAfter : "2015-01-01T00:00:00Z"
	        };

	        YoutubeService.search(getSearchResultsParams)
	        .then(YoutubeServiceSearchSuccess)
	        .catch(YoutubeServiceSearchError);

		}
	}

	function YoutubeServiceSearchSuccess(searchList){
		vm.searchVideoIds = '';
		vm.searchResults = [];
		angular.forEach( searchList.data.items, function(searchListItem){
			vm.searchVideoIds = vm.searchVideoIds + searchListItem.id.videoId + ',';
			vm.searchResults.push(searchListItem);
		});

		vm.searchVideoIds = vm.searchVideoIds.slice(0,-1);

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
			vm.searchResults[i++].duration = VideoService.parseDuration( videoListItem.contentDetails.duration );
			vm.searchResultsFound = true;
		});
	}

	function YoutubeServiceVideosError(err){
		console.log("error", JSON.stringify(err));
	}

	function YoutubeServiceSearchError(err){
		console.log("error", JSON.stringify(err));
	}

	function goBack(){
		$ionicHistory.goBack();
	}

	$window.myAmazingFunction = function(data){
    	vm.autoSearchResults = [];
    	for(var i=0;i<data[1].length;i++)
	    {
	      var result = { title : data[1][i][0]};
	      vm.autoSearchResults.push(result);
	    }
    }

	// search function to match full text
	function youtubeSearch(str, autoSearchResults) {
		var myScript = document.createElement('script');
    	myScript.src='http://suggestqueries.google.com/complete/search?hl=en&ds=yt&jsonp=myAmazingFunction&client=youtube&q='+str;
    	document.body.appendChild(myScript);
    	return vm.autoSearchResults;
	}

	function selected(str){
		console.log("selected", str);
		if(str !== undefined){
			vm.searchKey = str.title;
			doSearch();
		}
		else{
			vm.searchKey = '';
		}
	}

	function loadMoreVideos() {
		var temp = vm.searchResults;
		vm.searchResults = (vm.searchResults).concat(temp);
		$scope.$broadcast('scroll.infiniteScrollComplete');
	}

	function getVideoPicUrl(picUrl) {
		console.log('SearchCtrl', picUrl);
		VideoService.setPicUrl(picUrl);
	}

	function getSop(videoId) {
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
				controls : 1,
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

	vm.$onInit = init();
}

SearchSopController.$inject = ['$scope', '$rootScope', '$interval', '$state', 'CommonService', 'PlayCrispsService', 'PopupService', 'ModalService'];

function SearchSopController($scope, $rootScope, $interval, $state, CommonService, PlayCrispsService, PopupService, ModalService){

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
	console.log("sopControls", JSON.stringify($scope.SearchCtrl.sopControls));
	$scope.SearchCtrl.sopControls = {
		'close' : close
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
		vm.player.seekTo($scope.SearchCtrl.sop.crisps[0]['start']);
		console.log(JSON.stringify($scope.SearchCtrl.sop.crisps));
 		vm.sopInterval = $interval(playCrisps, 200);
	}

	function playCrisps(){
		PlayCrispsService.playCrisps(
			vm.player,
			vm.sopInterval,
			$scope.SearchCtrl.sop,
			vm.confirmOptions
		);
	}

	$scope.$on('youtube.player.ready', onPlayerReady);

	function fullVideo(){
		ModalService.close($scope, 'sop');
		screen.orientation.unlock();
		$state.go(
			'app.searchView',
			{
				videoId : $scope.SearchCtrl.sop.videoId
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
		$scope.SearchCtrl.sop = {};
	}
}