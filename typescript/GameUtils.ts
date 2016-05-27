window['requestAnimFrame'] = function(){
    return (
        window['requestAnimationFrame']       ||
        window['webkitRequestAnimationFrame'] ||
        window['mozRequestAnimationFrame']    ||
        window['oRequestAnimationFrame']      ||
        window['msRequestAnimationFrame']     ||
        function(callback){
            window.setTimeout(callback, 1000 / 60);
        }
    );
}();

var stopSound = function(){
	resource_manager.play_sound = false;
}

var startSound = function(){
	if (!resource_manager.can_play_sound) return;
	resource_manager.play_sound = true;
}

var stopMusic = function(){
	resource_manager.play_music = false;
	window.clearInterval(tryToPlay);
	tryToPlay = null;
	if (bg_music !== null && bg_music !== undefined){
		bg_music.stop();
		bg_music = null;
	}
}

var startMusic = function(){
	if (!resource_manager.can_play_sound) return;
	resource_manager.play_music = true;

	if (bg_name !== null && bg_name !== undefined){
		bg_music = Utils.playSound(bg_name, master_volume, 0, true);
	}
}

var SoundMouseDown = function(){
}

var SoundMouseUp = function(e){
	click_to_start = true;
	var box = canvas.getBoundingClientRect();

	var x = (e.clientX - box.left) / 2;
	var y = (e.clientY - box.top) / 2;

	if (x >= 4 && x <= 20){
		if (y >= 4 && y <= 20){
			if (resource_manager.play_music){
				stopMusic();
			}else if (resource_manager.can_play_sound){
				startMusic();
			}
		}

		else if (y >= 24 && y <= 40){
			if (resource_manager.play_sound){
				stopSound();
			}else if (resource_manager.can_play_sound){
				startSound();
			}
		}
	}
}
