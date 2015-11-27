//SECRET TROPHIES!!!
var Trophy = function(){};
Trophy.POWERS = 0;
Trophy.HAT = 1;
Trophy.DEATH = 2;
Trophy.SECRET = 3;
Trophy.GiveTrophy = function(trophy){
	var username = Utils.gup("gjapi_username");
	var user_token = Utils.gup("gjapi_token");
	if (username === null || username === '')
		return;
	console.log(username + ", ");// + user_token);
	
	//This stuff is contextual to my game jolt game, so 
	//if you're making a game in game jolt, the achievement token
	//for your game should be able to be used here
	var game_id = GJAPI.game_id;

	var url = "http://gamejolt.com/api/game/v1/trophies/add-achieved/?game_id="+game_id+"&username="+username+
				"&user_token="+user_token;
	switch (trophy){
		case Trophy.POWERS:
			url += "&trophy_id=9184";
			console.log("9184");
			break;
		case Trophy.HAT:	
			url += "&trophy_id=9185";
			console.log("9185");
			break;
		case Trophy.DEATH:
			url += "&trophy_id=9187";
			console.log("9187");
			break;
		case Trophy.SECRET:
			url += "&trophy_id=9186";
			console.log("9186");
			break;
		default: break;
	}
	
	//TODO:: BEFORE COMMITTING TO GIT, ADD THIS SOMEWHERE ELSE AND HIDE IT!!!
	var signature = url + GJAPI.private_token;
	signature = md5(signature);
	
	var xmlhttp = new XMLHttpRequest();
	var url = url + "&signature=" + signature;
	xmlhttp.open("GET", url, true);
	xmlhttp.send();
}

Trophy.AddScore = function(score, sort, table_id){
	var username = Utils.gup("gjapi_username");
	var user_token = Utils.gup("gjapi_token");
	if (username === null || username === '')
		return;
	console.log(username + ", " + user_token);
	
	//This stuff is contextual to my game jolt game, so 
	//if you're making a game in game jolt, the achievement token
	//for your game should be able to be used here
	var game_id = GJAPI.game_id;
	
	var url = "http://gamejolt.com/api/game/v1/scores/add/?game_id="+game_id+"&username="+username+"&user_token="+user_token+"&score="+score+"&sort="+sort+"&table_id="+table_id;
	
	var signature = url + GJAPI.private_token;
	signature = md5(signature);
	
	var xmlhttp = new XMLHttpRequest();
	var url = url + "&signature=" + signature;
	xmlhttp.open("GET", url, true);
	xmlhttp.send();
}