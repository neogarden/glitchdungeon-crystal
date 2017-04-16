var img_path = "assets/images/";
var snd_path = "assets/sounds/";
//Display the loading screen while everything else is loading...
var ResourceManager = (function () {
    function ResourceManager() {
        //IMAGE VARIABLE DECLARATION
        this.images_loaded = 0;
        this.image_names = [
            "soundButtons",
            "player_grey_sheet",
            "hat_grey_sheet",
            "tile_grey_sheet",
            "player_sheet",
            "npc_sheet",
            "obj_sheet",
            "player_green_sheet",
            "tile_green_sheet",
            "collection_sheet",
            "player_red_sheet",
            "tile_red_sheet",
            "enemy_sheet",
            "player_zero_sheet",
            "tile_zero_sheet",
            "player_gold_sheet",
            "tile_gold_sheet",
            "player_blue_sheet",
            "tile_blue_sheet",
            "player_negative_sheet",
            "tile_negative_sheet",
            "player_pink_sheet",
            "tile_pink_sheet",
        ];
        this.necessary_images = 9;
        this.num_images = this.image_names.length;
        //SOUND VARIABLE DECLARATION
        this.play_sound = true;
        this.play_music = true;
        this.can_play_sound = true;
        this.sounds_loaded = 0;
        this.sound_names = [
            "jump",
            "land",
            "LA_Stairs",
            "locked",
            "checkpoint",
            "hurt",
            "pickup",
            "LA_Chest_Open",
            "switchglitch",
            "error",
            "RoccoW_outOfSight",
            "lhommeEraseForm",
            "Rolemusic_deathOnTheBattlefield",
            "TomWoxom_North",
            "RoccoW_iveGotNothing"
        ];
        this.necessary_sounds = 0;
        this.num_sounds = this.sound_names.length;
        try {
            window['AudioContext'] = window['AudioContext'] || window['webkitAudioContext'];
            this.audio_context = new AudioContext();
        }
        catch (e) {
            console.log(e);
            this.audio_context = null;
            this.play_sound = false;
            this.play_music = false;
            this.can_play_sound = false;
        }
    }
    ResourceManager.prototype.DisplayLoadScreen = function (ctx) {
        ctx.scale(2, 2);
        //Display the LOADING... screen
        ctx.fillStyle = "rgb(0, 0, 0)";
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.fillStyle = "rgb(255,255,255)";
        //ctx.font = "24px pixelFont";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.fillText("LOADING GAME...", 64, GAME_HEIGHT / 8 + 25 - 16);
        ctx.fillText("PLEASE WAIT :)", 64, GAME_HEIGHT / 8 + 80 - 16);
        ctx.scale(0.5, 0.5);
    };
    ResourceManager.prototype.ImageLoad = function () {
        this.images_loaded++;
        this.CheckLoadedResources();
    };
    ResourceManager.prototype.SoundLoad = function () {
        this.sounds_loaded++;
        this.CheckLoadedResources();
    };
    //LOAD ALL THE RESOURCES
    ResourceManager.prototype.LoadResources = function (ctx) {
        this.DisplayLoadScreen(ctx);
        //Load Images
        for (var i = 0; i < this.image_names.length; i++) {
            var timeoutCallback = (function (self, img) {
                self[img] = new Image();
                self[img].onload = self.ImageLoad();
                self[img].src = img_path + img + ".png";
            })(this, this.image_names[i]);
            setTimeout(timeoutCallback, 0);
        }
        if (this.audio_context === null || !this.can_play_sound) {
            this.sounds_loaded = this.sound_names.length;
            return;
        }
        //Load Sounds
        for (var i = 0; i < this.sound_names.length; i++) {
            var timeoutCallback = (function (self) {
                var snd = self.sound_names[i];
                self.loadBuffer(snd_path + snd + ".wav", snd);
            })(this);
            setTimeout(timeoutCallback, 0);
        }
    };
    ResourceManager.prototype.loadBuffer = function (url, index) {
        // Load buffer asynchronously
        var request = new XMLHttpRequest();
        request.open("GET", url, true);
        request.responseType = "arraybuffer";
        var loader = this;
        request.onload = function () {
            // Asynchronously decode the audio file data in request.response
            loader.audio_context.decodeAudioData(request.response, function (buffer) {
                if (!buffer) {
                    alert('error decoding file data: ' + url);
                    return;
                }
                loader[index] = buffer;
                loader.SoundLoad();
                //Force sequential sound loading
                //setTimeout(loader.LoadNextSound.bind(loader), 0);
            }, function (error) {
                console.error('decodeAudioData error', error);
            });
        };
        request.onerror = function () {
            console.log('BufferLoader: XHR error');
        };
        request.send();
    };
    ResourceManager.prototype.CheckLoadedResources = function () {
        if (this.images_loaded >= this.necessary_images
            && this.sounds_loaded >= this.necessary_sounds) {
            if (!game_started)
                startGame();
        }
    };
    return ResourceManager;
}());
