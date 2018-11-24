var domain = 'http://13.233.19.166:1337/';
//52.66.156.146
//192.168.43.143


angular
.module('common')
.constant('GlobalConstants', {
	'YoutubeAPIKey' : 'AIzaSyDrn0qvx-FuwcHVezsaUTjDaWL3QvtyJjE',
	'GoogleLogin' : { 
		'scopes' : 'https://www.googleapis.com/auth/youtube.force-ssl',
		'webClientId' : '255256607501-nkrlqpqr4im20ef8tdg05ottlo3btndh.apps.googleusercontent.com'
	},
	'getSopURL' : domain + 'summary'
});
