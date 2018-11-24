angular
  .module('junction-app')
  .config(appConfig);

appConfig.$inject = ['$stateProvider', '$urlRouterProvider', '$ionicConfigProvider'];

function appConfig($stateProvider, $urlRouterProvider, $ionicConfigProvider) {

	$ionicConfigProvider.backButton.previousTitleText(false).text('');

	$stateProvider

	    .state('app', {
	      url: '/app',
	      abstract: true,
	      templateUrl: 'menu/menu.html',
	      controller: 'MenuController',
	      controllerAs: 'MenuCtrl'
	    })

	    
	    .state('app.home', {
	      url: '/home',
	      views: {
	        'menuContent': {
	          templateUrl: 'home/home.html',
	          controller: 'HomeController',
	          controllerAs: 'HomeCtrl'
	        }
	      }
	    })

	    .state('app.homeView', {
	      url: '/home/:videoId',
	      views: {
	        'menuContent': {
	          templateUrl: 'video/video.html',
	          controller: 'VideoController',
	          controllerAs: 'VideoCtrl'
	        }
	      }
	    })

	    .state('app.search', {
	      url: '/search',
	      views: {
	        'menuContent': {
	          templateUrl: 'search/search.html',
	          controller: 'SearchController',
	          controllerAs: 'SearchCtrl'
	        }
	      }
	    })

	    .state('app.searchView', {
	      url: '/search/:videoId',
	      views: {
	        'menuContent': {
	          templateUrl: 'video/video.html',
	          controller: 'VideoController',
	          controllerAs: 'VideoCtrl'
	        }
	      }
	    })

	    .state('app.myCrisps', {
	      url: '/myCrisps',
	      views: {
	        'menuContent': {
	          templateUrl: 'myCrisps/myCrisps.html',
	          controller: 'MyCrispsController',
	          controllerAs: 'MyCrispsCtrl'
	        }
	      }
	    })

	    .state('app.myCrispsView', {
	      url: '/myCrisps/:videoId',
	      views: {
	        'menuContent': {
	          templateUrl: 'video/video.html',
	          controller: 'VideoController',
	          controllerAs: 'VideoCtrl'
	        }
	      }
	    })

	    
	    .state('app.sharedCrisps', {
	      url: '/sharedCrisps',
	      views: {
	        'menuContent': {
	          templateUrl: 'sharedCrisps/sharedCrisps.html',
	          controller: 'SharedCrispsController',
	          controllerAs: 'SharedCrispsCtrl'
	        }
	      }
	    })

	    .state('app.sharedCrispsView', {
	      url: '/sharedCrisps/:videoId',
	      views: {
	        'menuContent': {
	          templateUrl: 'video/video.html',
	          controller: 'VideoController',
	          controllerAs: 'VideoCtrl'
	        }
	      }
	    });
	// if none of the above states are matched, use this as the fallback
	$urlRouterProvider.otherwise('/app/home');
}
