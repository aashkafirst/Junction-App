angular
.module('common')
.service('ShareService', ShareService);

ShareService.$inject = [];

function ShareService() {

	angular.extend(this, {
		createBranchObject : createBranchObject,
		createShortUrl : createShortUrl
	});

	var properties = {
		canonicalIdentifier: 'share',
		canonicalUrl: 'https://9tmg.app.link',
		title: 'youmate',
		contentDescription: 'myapp',
		contentMetadata: {
			'alias':'dashboard'
		}
    };

    function createBranchObject( picUrl, videoId, crisps, duration ){
    	properties.contentImageUrl = picUrl;
    	properties.contentMetadata.videoId = videoId;
    	properties.contentMetadata.crisps = crisps;
    	properties.contentMetadata.duration = duration;
    	console.log(JSON.stringify(properties));
    	return Branch.createBranchUniversalObject( properties );
    }

    function createShortUrl(branchUniversalObj){
    	return branchUniversalObj.generateShortUrl(
    		{
					// put your link properties here
			},
			{
				"$ios_url":"https://google.com",
				"$android_deeplink_path" : "/dashboard"
			}
		);	
    }
}