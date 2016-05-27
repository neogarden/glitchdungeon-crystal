var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Checkpoint = (function (_super) {
    __extends(Checkpoint, _super);
    function Checkpoint(x, y) {
        _super.call(this, x, y, 4, 5, 12, 16, "obj_sheet");
        this.active = false;
        this.lex = 1;
        this.id = new Date().getTime();
        this.is_glitched = false;
        this.type = "Checkpoint";
        this.animation.Change(2, 0, 1);
        this.z_index = 9;
    }
    Checkpoint.prototype.Import = function (obj) {
        _super.prototype.Import.call(this, obj);
        this.id = obj.id == undefined ? new Date().getTime() : obj.id;
    };
    Checkpoint.prototype.Export = function () {
        var obj = _super.prototype.Export.call(this);
        obj.id = this.id;
        return obj;
    };
    Checkpoint.prototype.Update = function (map) {
        GameSprite.prototype.Update.call(this, map);
        if (this.IsColliding(player)) {
            player.touching_checkpoint = true;
            if (!this.active) {
                if (this.is_glitched) {
                    Utils.playSound("checkpoint", master_volume, 0);
                    this.active = true;
                    this.animation.Change(this.lex, 0, 2);
                    return;
                }
                else {
                    room_manager.DeactivateCheckpoints();
                    room_manager.checkpoint = {
                        id: this.id,
                        x: this.x, y: this.y,
                        room_x: room_manager.room_index_x,
                        room_y: room_manager.room_index_y,
                        facing: player.facing
                    };
                    Utils.playSound("checkpoint", master_volume, 0);
                    this.active = true;
                    this.animation.Change(this.lex, 0, 2);
                }
            }
        }
    };
    Checkpoint.prototype.Deactivate = function () {
        this.active = false;
        this.animation.Change(this.lex + 1, 0, 1);
    };
    return Checkpoint;
}(GameSprite));
