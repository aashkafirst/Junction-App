angular
.module('video')
.service('YoutubeService', YoutubeService);

YoutubeService.$inject = ['$http'];

function YoutubeService($http) {

	angular.extend(this, {
		search : search,
		videos : videos
	});

	function search(searchParams){
		return $http.get(
							'https://www.googleapis.com/youtube/v3/search',
							{ params : searchParams }
						);
	}

	function videos(videosParams){
		return $http.get(
							'https://www.googleapis.com/youtube/v3/videos', 
							{ params : videosParams }
						);
	}

}