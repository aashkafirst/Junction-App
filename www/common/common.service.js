angular
.module('common', [])
.service('CommonService', CommonService);

CommonService.$inject = ['$interval', '$http', 'GlobalConstants'];

function CommonService($interval, $http, GlobalConstants) {

	angular.extend(this, {
		cancelInterval : cancelInterval,
		colorGenerator : colorGenerator,
		getSop : getSop
	});

	function cancelInterval(intervalObj) {
		if(intervalObj)
		{
			$interval.cancel( intervalObj );
		}
	}

	function colorGenerator(){
		var rangeSize = 100; // adapt as needed
	    var color = [
	        Math.floor(Math.random() * 256),
	        Math.floor(Math.random() * rangeSize),
	        Math.floor(Math.random() * rangeSize) + 256 - rangeSize 
	    ]
    	.sort(function (a, b) {
			return Math.random() < 0.5;
		})
    	.map(function (p) {
			return ('0' + p.toString(16)).substr(-2);
		})
		.join('');
    	
    	return color;
	}

	function getSop(sopInfo){
		return $http.post(GlobalConstants.getSopURL, sopInfo);
	}

}