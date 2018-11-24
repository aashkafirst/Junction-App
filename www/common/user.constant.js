var domain = 'http://13.233.19.166:1337/';
//52.66.156.146
//192.168.43.143

angular
.module('common')
.constant('UserConstants', {
		'loginURL' : domain + 'login',
		'sendCrispsURL' : domain + 'highlights',
		'getCrispsURL' : domain + 'getCrisps',
		'deleteCrispURL' : domain + 'deleteCrisp'
});
