angular
.module('common')
.service('UserService', UserService);

UserService.$inject = ['UserConstants', '$http', '$rootScope'];

function UserService(UserConstants, $http, $rootScope) {

	angular.extend(this, {
		login : login,
		addUserToLocalStorage : addUserToLocalStorage,
		sendCrisps : sendCrisps,
		getCrisps : getCrisps,
		deleteCrisp : deleteCrisp,
		logout : logout,
		name : '', 
		accessToken : '',
		profilePic : ''
	});

	function login(serverAuthCode, idToken, name, accessToken, profilePic) {
		console.log("service"+serverAuthCode+idToken);
		this.name = name;
		this.accessToken = accessToken;
		this.profilePic = profilePic;
		return $http.post(UserConstants.loginURL, {"serverAuthCode":serverAuthCode, "idToken":idToken});
	}

	function addUserToLocalStorage(jwtToken){
		$rootScope.userSession = true;
		$rootScope.name = this.name;
		$rootScope.profilePic = this.profilePic;
		console.log($rootScope.name, ':', $rootScope.profilePic);
		localStorage.setItem("jwtToken", jwtToken);
		localStorage.setItem("accessToken", this.accessToken);
		localStorage.setItem("session", true);
	}

	function sendCrisps(video){
		return $http.post(UserConstants.sendCrispsURL, video);
	}

	function getCrisps(type){
		var json={
			"jwtToken" : localStorage.getItem("jwtToken"),
			"type" : type
		};
		return $http.post(UserConstants.getCrispsURL, json);
	}

	function deleteCrisp(videoId, type) {
		var json={
			"jwtToken" : localStorage.getItem("jwtToken"),
			"type" : type,
			"videoId" : videoId
		};
		return $http.post(UserConstants.deleteCrispURL, json);
	}

	function logout(){
		$rootScope.name = '';
		$rootScope.profilePic = '';
		localStorage.removeItem("jwtToken");
		localStorage.removeItem("accessToken");
		localStorage.removeItem("session");
	}
}