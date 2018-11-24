angular
.module('common')
.service('PlayCrispsService', PlayCrispsService);

PlayCrispsService.$inject = ['PopupService', 'CommonService'];

function PlayCrispsService(PopupService, CommonService) {

	angular.extend(this, {
		playCrisps : playCrisps
	});

	var i = 0;

	function playCrisps(player, myCrispInterval, currentCrisp, confirmOptions) {
		if(confirmOptions) {
			currentCrisp.annotation = currentCrisp.crisps[i]['annotation'];
		}	  
		if(i < currentCrisp.crisps.length && player.getCurrentTime() >= currentCrisp.crisps[i]['end']) {
            if(i === currentCrisp.crisps.length - 1) {
            	player.pauseVideo();
	            i=0;
	            CommonService.cancelInterval(myCrispInterval);
	            console.log('destroyed');
	            if(confirmOptions) {
	            	player.stopVideo();	            	
	            	currentCrisp.annotation = '';
	            	PopupService.confirm('Ended playing', 'Choose one option', confirmOptions);
	            }
            }
            else {
            	console.log('seekTo');
            	player.seekTo(currentCrisp.crisps[++i]['start']);
            }
        }
	}

}