var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Player = (function (_super) {
    __extends(Player, _super);
    function Player(x, y) {
        _super.call(this, x, y, 2, 2, 14, 16, "player_grey_sheet");
        this.touching_door = false;
        this.touching_checkpoint = false;
        this.speaking = false;
        this.num_deaths = 0;
        this.spells_cast = 0;
        this.is_moving_to_spot = false;
        this.spot_to_move_to = new Point(0, 0);
        this.glitch_type = Glitch.GREY;
        this.glitch_index = -1;
        this.type = "Player";
        this.animation.frame_height = 16;
        this.inventory = {
            spellbook: {
                active: false,
                level: 0,
                spells: []
            },
            artifacts: []
        };
        this.z_index = -100;
    }
    Player.prototype.Load = function (obj) {
        _super.prototype.Load.call(this, obj);
        this.inventory = obj.inventory;
        this.glitch_type = obj.glitch_type;
        this.glitch_index = obj.glitch_index;
        this.num_deaths = obj.num_deaths;
        this.spells_cast = obj.spells_cast;
    };
    Player.prototype.Save = function () {
        var obj = _super.prototype.Save.call(this);
        obj.inventory = this.inventory;
        obj.glitch_type = this.glitch_type;
        obj.glitch_index = this.glitch_index;
        obj.num_deaths = this.num_deaths;
        obj.spells_cast = this.spells_cast;
        return obj;
    };
    Player.prototype.Import = function (obj) {
        _super.prototype.Import.call(this, obj);
    };
    Player.prototype.Export = function () {
        var obj = _super.prototype.Export.call(this);
        obj.img_name = "player_grey_sheet";
        return obj;
    };
    Player.prototype.NumArtifacts = function () {
        return this.inventory['spellbook'].spells.length;
    };
    Player.prototype.AddSpell = function (spell) {
        var spellbook = this.inventory['spellbook'];
        var level = spellbook.level;
        if (level == 0) {
            var prev_spell = null;
            if (spellbook.spells.length >= 1)
                prev_spell = spellbook.spells[0];
            spellbook.spells = [spell];
        }
        else if (level >= 1) {
            if (spellbook.spells.indexOf(spell) < 0)
                spellbook.spells.push(spell);
        }
    };
    Player.prototype.Update = function (map) {
        this.DieToSpikesAndStuff(map);
        _super.prototype.Update.call(this, map);
        this.touching_door = false;
        this.touching_checkpoint = false;
        if (this.is_moving_to_spot) {
            this.spot_to_move_to.x = ~~this.spot_to_move_to.x;
            this.move_state = MoveState.RUNNING;
            this.horizontal_input = true;
            if (this.spot_to_move_to.x + 0.5 < this.x)
                this.x--;
            else if (this.spot_to_move_to.x - 0.5 > this.x)
                this.x++;
            else {
                this.is_moving_to_spot = false;
                this.speaking = false;
                this.move_state = MoveState.STANDING;
                this.horizontal_input = false;
                console.log("DONE!");
            }
            this.x = ~~this.x;
        }
    };
    Player.prototype.MoveToConversationSpot = function (npc) {
        this.vel.x = 0;
        var prev_facing = this.facing;
        this.is_moving_to_spot = true;
        this.spot_to_move_to.y = npc.y;
        if (npc.facing === Facing.LEFT) {
            this.spot_to_move_to.x = npc.x + npc.lb - this.rb;
            this.facing = Facing.RIGHT;
        }
        else {
            this.spot_to_move_to.x = npc.x + npc.rb - this.lb;
            this.facing = Facing.LEFT;
        }
    };
    Player.prototype.PressX = function () { };
    Player.prototype.MaintainGlitch = function () {
        var spellbook = this.inventory['spellbook'];
        var level = spellbook.level;
        var tileset = this.tilesheet_name;
        if (level == 0) {
            if (this.glitch_index == 0)
                Glitch.TransformPlayer(room, this.glitch_type, true, false, false);
            else
                Glitch.TransformPlayer(room, room.glitch_sequence[0], true, false, true);
        }
        else if (level == 1) {
            Glitch.TransformPlayer(room, this.glitch_type, true, false, true);
        }
        this.tilesheet_name = tileset;
    };
    Player.prototype.NextGlitch = function () {
        var spellbook = this.inventory['spellbook'];
        if (!spellbook.active || spellbook.spells.length == 0)
            return;
        this.spells_cast++;
        Utils.playSound("switchglitch", master_volume, 0);
        var level = spellbook.level;
        if (level == 0) {
            this.glitch_index++;
            if (this.glitch_index > 1)
                this.glitch_index = 0;
            if (this.glitch_index == 1) {
                this.glitch_type = room.glitch_sequence[0];
            }
            else {
                this.glitch_type = spellbook.spells[0];
            }
        }
        else if (level == 1) {
            this.glitch_index++;
            if (this.glitch_index >= this.inventory['spellbook'].spells.length)
                this.glitch_index = 0;
            if (this.glitch_index < 0) {
                this.glitch_type = Glitch.GREY;
            }
            if (this.glitch_index >= 0) {
                this.glitch_type = this.inventory['spellbook'].spells[this.glitch_index];
                room.glitch_time = 0;
            }
        }
        room.glitch_type = this.glitch_type;
        var spellbook = this.inventory['spellbook'];
        var level = spellbook.level;
        if (level == 0 && this.glitch_index == 0) {
            Glitch.TransformPlayer(room, this.glitch_type, true, false, false);
        }
        else {
            Glitch.TransformPlayer(room, this.glitch_type);
        }
    };
    Player.prototype.PrevGlitch = function () {
        var spellbook = this.inventory['spellbook'];
        if (!spellbook.active || spellbook.spells.length == 0)
            return;
        var level = spellbook.level;
        if (level == 0) {
            this.NextGlitch();
        }
        else if (level == 1) {
            this.glitch_index -= 2;
            if (this.glitch_index < 0)
                this.glitch_index += this.inventory['spellbook'].spells.length;
            this.NextGlitch();
        }
    };
    Player.prototype.DieToSpikesAndStuff = function (map) {
        var q = 3;
        var x = this.x;
        var y = this.y;
        var lb = this.lb;
        var tb = this.tb;
        var rb = this.rb;
        var bb = this.bb;
        for (var i = 0; i < map.entities.length; i++) {
            if (map.entities[i].kill_player && (this.IsRectColliding(map.entities[i], x + lb + q, y + tb + q, x + rb - q, y + bb - q))) {
                this.Die();
                return;
            }
        }
        var left_tile = Math.floor((this.x + this.lb + this.vel.x - 1) / Tile.WIDTH);
        var right_tile = Math.ceil((this.x + this.rb + this.vel.x + 1) / Tile.WIDTH);
        var top_tile = Math.floor((this.y + this.tb + this.vel.y - 1) / Tile.HEIGHT);
        var bottom_tile = Math.ceil((this.y + this.bb + this.vel.y + 1) / Tile.HEIGHT);
        for (var i = top_tile; i <= bottom_tile; i++) {
            for (var j = left_tile; j <= right_tile; j++) {
                if (!map.isValidTile(i, j))
                    continue;
                var tile = map.tiles[i][j];
                if (tile.collision != Tile.KILL_PLAYER && !tile.kill_player)
                    continue;
                if (this.IsRectColliding(tile, x + lb + q, y + tb + q, x + rb - q, y + bb - q)) {
                    this.Die();
                    return;
                }
            }
        }
    };
    Player.prototype.Die = function () {
        Utils.playSound("hurt", master_volume, 0);
        this.num_deaths++;
        room_manager.RevivePlayer();
    };
    Player.prototype.Render = function (ctx, camera) {
        if (this.image === null || !this.visible)
            return;
        var ani = this.animation;
        var row = ani.rel_ani_y;
        var column = ani.rel_ani_x + ani.curr_frame;
        ctx.drawImage(this.image, ani.frame_width * column + ani.abs_ani_x, ani.frame_height * row + ani.abs_ani_y, ani.frame_width, ani.frame_height, ~~(this.x - camera.x + camera.screen_offset_x + 0.5) + ani.x_offset, ~~(this.y - camera.y + camera.screen_offset_y + 0.5) + ani.y_offset, ani.frame_width, ani.frame_height);
        var f = -1;
        if (this.facing === Facing.LEFT)
            f = 1;
        if (!room_manager.beat_game)
            return;
        ctx.drawImage(resource_manager.hat_grey_sheet, ani.frame_width * column + ani.abs_ani_x, ani.frame_height * row + ani.abs_ani_y, ani.frame_width, ani.frame_height, ~~(this.x - camera.x + camera.screen_offset_x + 0.5) + ani.x_offset + f, ~~(this.y - camera.y + camera.screen_offset_y + 0.5) + ani.y_offset - 6, ani.frame_width, ani.frame_height);
    };
    return Player;
}(GameMover));
