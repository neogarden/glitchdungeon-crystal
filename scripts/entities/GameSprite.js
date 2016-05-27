var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var GameSprite = (function (_super) {
    __extends(GameSprite, _super);
    function GameSprite(x, y, lb, tb, rb, bb, img_name) {
        _super.call(this, x, y, lb, tb, rb, bb);
        this.visible = true;
        this.type = "GameSprite";
        this.img_name = img_name;
        if (this.img_name != undefined)
            this.image = eval("resource_manager." + this.img_name);
        else
            this.image = null;
        this.animation = new Animation(1, 8);
    }
    GameSprite.prototype.Import = function (obj) {
        _super.prototype.Import.call(this, obj);
        this.img_name = obj.img_name;
        this.image = eval("resource_manager." + this.img_name);
    };
    GameSprite.prototype.Export = function () {
        var obj = _super.prototype.Export.call(this);
        obj.img_name = this.img_name;
        return obj;
    };
    GameSprite.prototype.Update = function (map) {
        this.animation.Update();
        _super.prototype.Update.call(this, map);
    };
    GameSprite.prototype.Render = function (ctx, camera) {
        if (this.image === null || !this.visible)
            return;
        var ani = this.animation;
        var row = ani.rel_ani_y;
        var column = ani.rel_ani_x + ani.curr_frame;
        ctx.drawImage(this.image, ani.frame_width * column + ani.abs_ani_x, ani.frame_height * row + ani.abs_ani_y, ani.frame_width, ani.frame_height, ~~(this.x - camera.x + camera.screen_offset_x + 0.5) + ani.x_offset, ~~(this.y - camera.y + camera.screen_offset_y + 0.5) + ani.y_offset, ani.frame_width, ani.frame_height);
    };
    return GameSprite;
}(GameObject));
