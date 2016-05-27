var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Switcher = (function (_super) {
    __extends(Switcher, _super);
    function Switcher(x, y) {
        _super.call(this, x, y, 4, 5, 12, 16, "obj_sheet");
        this.glitch_type = 0;
        this.id = new Date().getTime();
        this.type = "Switcher";
        this.animation.Change(0, 2, 6);
        this.z_index = 9;
    }
    Switcher.prototype.Load = function (obj) {
        _super.prototype.Load.call(this, obj);
        this.glitch_type = obj.glitch_type;
    };
    Switcher.prototype.Save = function () {
        var obj = _super.prototype.Save.call(this);
        obj.glitch_type = this.glitch_type;
        return obj;
    };
    Switcher.prototype.Import = function (obj) {
        GameSprite.prototype.Import.call(this, obj);
        this.glitch_type = obj.glitch_type;
    };
    Switcher.prototype.Export = function () {
        var obj = GameSprite.prototype.Export.call(this);
        obj.glitch_type = this.glitch_type;
        return obj;
    };
    Switcher.prototype.ImportOptions = function (options) {
        this.glitch_type = Number(options.glitch_type.value);
    };
    Switcher.prototype.ExportOptions = function () {
        var options = {};
        options['glitch_type'] = new TextDropdown(Glitch.GetGlitchTypes(), this.glitch_type);
        return options;
    };
    Switcher.prototype.Update = function (map) {
        GameSprite.prototype.Update.call(this, map);
        if (this.IsColliding(player)) {
            if (player.pressed_down && player.pressing_down) {
                player.pressed_down = false;
                Utils.playSound("switchglitch", master_volume, 0);
                Glitch.TransformPlayer(room, this.glitch_type, true, false, true);
            }
        }
    };
    return Switcher;
}(GameSprite));
