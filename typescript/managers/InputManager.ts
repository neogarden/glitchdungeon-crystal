class InputManager{
    public key_manager: KeyManager;

    public constructor(key_manager){
        this.key_manager = key_manager;
    }

    public Update(player){
        if (player.speaking)
            this.SpeakingUpdate(player);
        else this.NormalUpdate(player);
    }

    public NormalUpdate(player){
        //	console.log(this.key_manager.keys_down);
      if (this.key_manager.keys_pressed[KeyManager.ENTER]) {
        room.paused = !room.paused;
      }
      if (room.paused) return;

      // moving with arrow keys
    	if (this.key_manager.keys_down[KeyManager.RIGHT]) {
    		player.MoveRight();
    	} else if (this.key_manager.keys_down[KeyManager.LEFT]) {
    		player.MoveLeft();
    	} else {
    		player.horizontal_input = false;
    	}
      if (this.key_manager.keys_down[KeyManager.DOWN]) {
        player.MoveDown();
      } else if (this.key_manager.keys_down[KeyManager.UP]) {
        player.MoveUp();
      } else {
        player.vertical_input = false;
      }

      // jumping
    	if (this.key_manager.keys_pressed[KeyManager.Z]){
    		player.StartJump();
    	}
    	else if (this.key_manager.keys_down[KeyManager.Z]){
    		player.Jump();
    	}
    	if (this.key_manager.keys_up[KeyManager.Z]){
    		player.StopJump();
    	}

    	if (this.key_manager.keys_pressed[KeyManager.X]){
    		player.Examine();
    	} else {
        player.StopExam();
      }

    	if (this.key_manager.keys_pressed[KeyManager.SPACE]){
            player.NextGlitch();
    	}

    	if (this.key_manager.keys_pressed[KeyManager.DEL]){
    		if (bg_name !== "RoccoW_iveGotNothing")
    			player.Die();
    	}

    	if (this.key_manager.keys_pressed[KeyManager.H]){
    		room_manager.beat_game = !room_manager.beat_game;
    		if (room_manager.beat_game)
    			Utils.playSound("pickup", master_volume, 0);
    		else Utils.playSound("error", master_volume, 0);
    	}

    	if (this.key_manager.keys_pressed[KeyManager.A]){
    		player.PrevGlitch();
    	}
    	if (this.key_manager.keys_pressed[KeyManager.S]){
    		player.NextGlitch();
    	}


    	//Restart the game
    	if ((this.key_manager.keys_pressed[KeyManager.SHIFT] && this.key_manager.keys_down[KeyManager.R]) || (this.key_manager.keys_down[KeyManager.SHIFT] && this.key_manager.keys_pressed[KeyManager.R])){
    		InputManager.RestartGame();
    	}
    }

    public SpeakingUpdate(player){
      if (this.key_manager.keys_pressed[KeyManager.X]) {
    		player.Examine();
    	} else {
        player.StopExam();
      }
    }

    public static RestartGame(){
    	room_manager.Restart();
    	room = room_manager.GetRoom();

    	console.log("start");
    	//Let's play the game!
    	then = Date.now();

    	bg_name = "RoccoW_outOfSight";
    	if (resource_manager.play_music){
    		stopMusic();
    		startMusic();
    	}

    	//InputManager.RestartGame = function(){}
    }
}
