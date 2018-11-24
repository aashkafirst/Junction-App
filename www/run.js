angular
.module('junction-app')
.run(ionicRun);

ionicRun.$inject = ['$ionicPlatform', 'GooglePlusService', '$rootScope'];

function ionicRun($ionicPlatform, GooglePlusService, $rootScope) {
	
  $ionicPlatform.ready( platformReady );

  function platformReady() {
    
    $rootScope.isOnline = true;

    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    
    if (window.StatusBar) {
      StatusBar.styleDefault();
    }

    if(localStorage.getItem("session"))
    {
      GooglePlusService.silentLogin(silentLoginSuccess, silentLoginError);
    }

    function silentLoginSuccess(loginData) {
      $rootScope.userSession = true;
      $rootScope.name = loginData.givenName;
      $rootScope.profilePic = loginData.imageUrl;
      console.log("success" + localStorage.getItem('jwtToken') + localStorage.getItem('accessToken'));
    }

    function silentLoginError(err) {
      $rootScope.userSession = false;
      console.log('error: ' + err);
    }

    Branch.initSession( initSession )
    .then(initSessionSuccess)
    .catch(initSessionError);

    function initSession(linkData) {
      console.log(JSON.stringify(linkData));
      $rootScope.$emit('catchSharedWithU', linkData);
    }

    function initSessionSuccess(linkSuccessResponse) {
      console.log('Response: ' + JSON.stringify(linkSuccessResponse));
    }

    function initSessionError(err) {
      console.log('Error from init: ' + JSON.stringify(err))
    }

  }
}