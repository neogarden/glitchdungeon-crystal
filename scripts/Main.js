var master_volume = 0.5;

var bg_music = null;
var bg_name = "RoccoW_outOfSight";
var tryToPlay = null;
var click_to_start = false;

var GAME_WIDTH = 640;
var GAME_HEIGHT = 480;

var canvas;
var ctx;

//primitive variables
var game_started = false;
var then;
var fontColor = "rgb(0,0,0)";

//managers
var level_edit_manager;
var room_manager;
var key_manager;
var input_manager;
var resource_manager;

var room;
var update_time = 0.33;

var init = function(){
	level_edit_manager = new LevelEditManager();
	//comment out if not allowing level editing
	level_edit_manager.Init();
	console.log("init");
	
	canvas = $("game_canvas");
	canvas.tabIndex = 1;
	canvas.width = GAME_WIDTH;
	canvas.height = GAME_HEIGHT;
	ctx = canvas.getContext("2d");
	set_textRenderContext(ctx);
	click_to_start = false;
	
	canvas.onmousedown = function(e){
		level_edit_manager.MouseDown(e); 
		SoundMouseDown(e)
	}.bind(this);
	canvas.onmousemove = function(e){ 
		level_edit_manager.MouseMove(e); 
	};
	canvas.onmouseup = function(e){ 
		level_edit_manager.MouseUp(e); 
		SoundMouseUp(e); 
	};
	
	//Handle keyboard controls
	key_manager = new KeyManager();
	window.onkeydown = key_manager.KeyDown.bind(key_manager);
	window.onkeyup = key_manager.KeyUp.bind(key_manager);
	
	input_manager = new InputManager(key_manager);
	
	//When load resources is finished, it will trigger startGame
	setTimeout(function(){
		resource_manager = new ResourceManager();
		resource_manager.LoadResources(ctx);
	}, 1);
};

var startGame = function(){
	if (game_started) return;
	game_started = true;

	room_manager = new House();
	room_manager.Import("main", function(){
		room = room_manager.GetRoom();
		level_edit_manager.setTileImg(0, 1);
		
		//Let's play the game!
		console.log("start");
		then = Date.now();
		
		bg_name = "RoccoW_outOfSight";
		stopMusic();
		startMusic();
		requestAnimFrame(tick);
	}.bind(this));
};

//main game loop
var tick = function(){
	var now = new Date().getTime();
	var elapsed = now - then;
	var timeout_time = update_time - elapsed;
	if (timeout_time < 0) timeout_time = 0;
	
	if (click_to_start){
		stopMusic();
		update();
		render();
	}else{		
		//Erase screen
		ctx.scale(2.0, 2.0);
		ctx.fillStyle = "#000000";
		ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
		
		//draw the game
		sharpen(ctx);
		
		ctx.fillStyle = "rgb(255,255,255)";
		//ctx.font = "24px pixelFont";
		ctx.textAlign = "center";
		ctx.textBaseline = "top";
		ctx.fillText("WARNING: FLASHING ITEMS", 134, GAME_HEIGHT/4+25);
		ctx.fillText("SCREEN MAY RAPIDLY CHANGE COLOR", 134, GAME_HEIGHT/4+49);
		ctx.fillText("CLICK TO START", 134, GAME_HEIGHT/4+80);
		ctx.scale(0.5, 0.5);
	}
	
	setTimeout(function(){
		requestAnimFrame(tick);
	}, timeout_time);
	then = now;
}

var player;
var erase_screen = true;
var update = function(){
    room.Update(input_manager);
	key_manager.ForgetKeysPressed();
};

var render = function(){
	//ctx.canvas.width = GAME_WIDTH*VIEW_SCALE;
	//ctx.canvas.height = GAME_HEIGHT*VIEW_SCALE;
	
	//Erase screen
	if (erase_screen){
		ctx.fillStyle = "rgb(0, 0, 0)";
		ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
	}
	
	//draw the game
	sharpen(ctx);
	room.Render(ctx, level_edit);
	
	//draw sound buttons
	var ani_x = 0;
	if (!resource_manager.play_music) ani_x = 16;
	
	ctx.scale(2.0, 2.0);
	ctx.drawImage(resource_manager.soundButtons, 
		//SOURCE RECTANGLE
		ani_x, 0, 16, 16,
		//DESTINATION RECTANGLE
		4, 4, 16, 16
	);
	
	ani_x = 0;
	if (!resource_manager.play_sound) ani_x = 16;
	ctx.drawImage(resource_manager.soundButtons, 
		//SOURCE RECTANGLE
		ani_x, 16, 16, 16,
		//DESTINATION RECTANGLE
		4, 24, 16, 16
	);
	ctx.scale(0.5, 0.5);
};

window.onload= function(){setTimeout(init, 0);}