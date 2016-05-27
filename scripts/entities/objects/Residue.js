var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Residue = (function (_super) {
    __extends(Residue, _super);
    function Residue(x, y, glitched_checkpoint) {
        _super.call(this, x, y, 4, 5, 12, 16, "obj_sheet");
        this.id = new Date().getTime();
        this.type = "Residue";
        this.animation.Change(3, 1, 2);
        this.glitched_checkpoint = glitched_checkpoint;
        this.z_index = 9;
    }
    Residue.prototype.Update = function (map) {
        _super.prototype.Update.call(this, map);
        if (this.IsColliding(player)) {
            player.touching_checkpoint = true;
            if (player.pressed_down && player.pressing_down) {
                player.pressed_down = false;
                Utils.playSound("checkpoint", master_volume, 0);
                this.GlitchRevivePlayer();
            }
        }
    };
    Residue.prototype.GlitchRevivePlayer = function () {
        room_manager.room_index_x = this.glitched_checkpoint.room_x;
        room_manager.room_index_y = this.glitched_checkpoint.room_y;
        room_manager.ChangeRoom();
        player.x = this.glitched_checkpoint.x;
        player.y = this.glitched_checkpoint.y;
        player.facing = this.glitched_checkpoint.facing;
        player.die_to_suffocation = true;
        Utils.playSound("switchglitch", master_volume, 0);
    };
    return Residue;
}(GameSprite));
