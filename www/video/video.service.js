angular
.module('video')
.service('VideoService', VideoService);

VideoService.$inject = ['CommonService'];

function VideoService(CommonService) {

	angular.extend(this, {
		updateProgressBar : updateProgressBar,
		updateConnectedProperty : updateConnectedProperty,
		onProgressBarChange : onProgressBarChange,
		createCrisp : createCrisp,
		pushCrisp : pushCrisp,
		checkOverlap : checkOverlap,
		destroyCrisp : destroyCrisp,
		convertTimeToHMS : convertTimeToHMS,
		parseDuration : parseDuration,
		picUrl : '',
		setPicUrl : setPicUrl,
		getPicUrl : getPicUrl
	});

	function updateProgressBar(player, progressBar){
		progressBar.value = player.getCurrentTime() * 100 / player.getDuration();
		player.currentTime = convertTimeToHMS( player.getCurrentTime() );
	}

	function updateConnectedProperty(connectedPlayer, connectedProgressBar, seekTo){
		connectedPlayer.seekTo(seekTo);
		connectedProgressBar.value = connectedPlayer.getCurrentTime() * 100 / connectedPlayer.getDuration();
		connectedPlayer.currentTime = convertTimeToHMS( connectedPlayer.getCurrentTime() );
	}

	function onProgressBarChange(player, value, progressBarInterval){
		CommonService.cancelInterval( progressBarInterval );
		player.seekTo( player.getDuration() * value / 100 );	
	}

	function createCrisp( left, id, color, width ) {
		console.log(left, id, color, width);
		var hex = '#' + color,
		    div = document.createElement('div');
		div.className = 'c' + color;
		angular
			.element( document.querySelector( '#' + id ) )
			.append(div);
		angular
				.element( document.querySelector( '#' + id + ' .c' + color ) )
				.css({
						"width" : width + "%",
						"background-color" : hex,
						"margin-left" : left + "%",
						"height" : "10px",
						"z-index" : 1,
						"position" : "absolute"
					});
	}


	function pushCrisp( crisps, crisp, target ) {
		if(target === 'crisps'){
			crisps.push({
				'start' : crisp.start,
				'end' : crisp.end,
				'annotation' : crisp.annotation
			});	
		}
		else{
			crisps.push({
				start : convertTimeToHMS(crisp.start),
				end : convertTimeToHMS(crisp.end),
				annotation : crisp.annotation,
				css : {
					new : crisp.css.new,
					color : crisp.css.color,
					left : crisp.css.left,
					width : crisp.css.width
				}
			});	
		}
	}

	function checkOverlap(crisps)
	{
		var overlaps = [];
		//console.log(crisps, crisps[crisps.length -1]);
		for( var i=0, j=0 ; i < crisps.length - 1 ; i++ )
		{
			var crisp = crisps[i], latestCrisp = crisps[ crisps.length - 1 ];
			if( (latestCrisp.start <= crisp.start && crisp.start <= latestCrisp.end) || (latestCrisp.start <= crisp.end && crisp.end <= latestCrisp.end) )
				overlaps[j++]=i;
			if( crisp.start <= latestCrisp.start && latestCrisp.start <= crisp.end && crisp.start <= latestCrisp.end && latestCrisp.end <= crisp.end)
			{
				overlaps[j++]=i;
			}
		}
		return overlaps;
	}

	function destroyCrisp(overlaps, progressBarId, connectedProgressBarId, crisps, displayCrisps)
	{		
		var progressBar = document.getElementById(progressBarId),
			connectedProgressBar = document.getElementById(connectedProgressBarId);
		for( var i=0 ; i<overlaps.length ; i++ )
		{
			removeChildNodes(
				overlaps[i] - i,
				progressBar,
				connectedProgressBar
			);
			spliceCrisps(
				overlaps[i] - i,
				crisps,
				displayCrisps
			);
		}
		console.log('destroyCrisp final', JSON.stringify(crisps), JSON.stringify(displayCrisps));
	}

	function removeChildNodes(index, progressBar, connectedProgressBar){
		progressBar.removeChild( progressBar.childNodes[index + 22] );
		if(connectedProgressBar && typeof(connectedProgressBar.childNodes[index + 22]) === 'object' ){
			connectedProgressBar.removeChild( connectedProgressBar.childNodes[index + 22] );
		}
	}

	function spliceCrisps(index, crisps, displayCrisps){
		crisps.splice( index, 1 );
		displayCrisps.splice( index, 1 );
	}

	function convertTimeToHMS(currentTime){
		var hrs = ~~(currentTime / 3600);
	    var mins = ~~((currentTime % 3600) / 60);
	    var secs = ~~(currentTime % 60);
	    var ret = "";

	    if (hrs > 0) {
	        ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
	    }

	    ret += "" + mins + ":" + (secs < 10 ? "0" : "");
	    ret += "" + secs;
	    return ret;
	}

	function parseDuration(duration){
		var match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
		var hours = (parseInt(match[1]) || 0);
		var minutes = (parseInt(match[2]) || 0);
		var seconds = (parseInt(match[3]) || 0);
		if(0<= hours && hours<=9){
			hours = '0' + hours.toString();
		}
		if(0<= minutes && minutes<=9){
			minutes='0' + minutes.toString();
		}
		if(0<= seconds && seconds<=9){
			seconds='0' + seconds.toString();
		}
		var json={ "hours" : hours, "minutes" : minutes, "seconds" : seconds };
		return json;
	}

	function setPicUrl(picUrl) {
		this.picUrl = picUrl;
		console.log('service', this.picUrl);
	}

	function getPicUrl() {
		return this.picUrl;
	}
}