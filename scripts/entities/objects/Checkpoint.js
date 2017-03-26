var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Checkpoint = (function (_super) {
    __extends(Checkpoint, _super);
    function Checkpoint(x, y) {
        var _this = _super.call(this, x, y, 4, 5, 12, 16, "obj_sheet") || this;
        _this.active = false;
        _this.lex = 1;
        _this.id = new Date().getTime();
        _this.is_glitched = false;
        _this.type = "Checkpoint";
        _this.animation.Change(2, 0, 1);
        _this.z_index = 9;
        return _this;
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
