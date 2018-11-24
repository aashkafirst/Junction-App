angular
.module('menu', ['ngCordova'])
.controller('MenuController', MenuController);

MenuController.$inject = ['$scope', '$rootScope', '$state', '$cordovaNetwork', '$ionicSideMenuDelegate', 'UserService', 'GooglePlusService'];

function MenuController($scope, $rootScope, $state, $cordovaNetwork, $ionicSideMenuDelegate, UserService, GooglePlusService) {
	var vm = this;

	$rootScope.isOnline = true;
	$rootScope.name = '';
	$rootScope.profilePic = '';

	function onOffline(event, networkState) {
      console.log('offline', JSON.stringify(networkState));
      $rootScope.isOnline = false;
    }

    function onOnline(event, networkState) {
      console.log('online',JSON.stringify(networkState));
      $rootScope.isOnline = true;
    }

    $rootScope.$on('$cordovaNetwork:online', onOnline)
    $rootScope.$on('$cordovaNetwork:offline', onOffline)

	angular.extend(vm, {
		login : login,
		logout : logout,
		search : search
	});

	function login(){
		GooglePlusService.login(googleLoginSuccess, googleLoginError);
	}

	function googleLoginSuccess(user) {

  		console.log(JSON.stringify(user));
  		
  		UserService.login(
  			user.serverAuthCode,
  			user.idToken,
  			user.givenName,
  			user.accessToken,
  			user.imageUrl
  		)
		.then(loginSuccess)
		.catch(loginError);

  	}

  	function googleLoginError(err) {
  		console.log('error: ' + err);
  	}

  	function loginSuccess(loginResponse) {
		if(loginResponse.data['loggedIn']) {
			UserService.addUserToLocalStorage(loginResponse.data['loggedIn']);
		}
		else{
			console.log("try again");
		}
	}

	function loginError(err) {
		console.log("try again", JSON.stringify(err));
	}

	function logout(){
		console.log("logout");
		GooglePlusService.logout(logoutSuccess);
	}

	function logoutSuccess(logoutMsg) {
  		console.log(JSON.stringify(logoutMsg));
  		UserService.logout();
  		$rootScope.userSession=false;
  		$ionicSideMenuDelegate.toggleLeft();
	}

	function search(){
		$state.go('app.search');
	}

}