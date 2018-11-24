angular
.module('common')
.service('GooglePlusService', GooglePlusService);

GooglePlusService.$inject = [ 'GlobalConstants' ];

function GooglePlusService( GlobalConstants ) {

	angular.extend(this, {
		login : login,
		logout : logout,
		silentLogin : silentLogin
	});

	function login(googleLoginSuccess, googleLoginError) {
		window.plugins.googleplus.login(
	  		{
	  		  'scopes': GlobalConstants.GoogleLogin.scopes,
	  		  'webClientId': GlobalConstants.GoogleLogin.webClientId,
	  		  'offline': true
	  		},
  			googleLoginSuccess,
  			googleLoginError
  		);	
	}

	function logout(logoutSuccess) {
		window.plugins.googleplus.logout(
			logoutSuccess
		);
	}

	function silentLogin(silentLoginSuccess, silentLoginError) {
		window.plugins.googleplus.trySilentLogin(
			{
				'scopes': GlobalConstants.GoogleLogin.scopes,
				'webClientId': GlobalConstants.GoogleLogin.webClientId,
				'offline': false
			},
			silentLoginSuccess,
			silentLoginError
		);
	}

}
