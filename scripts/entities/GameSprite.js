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
var GameSprite = (function (_super) {
    __extends(GameSprite, _super);
    function GameSprite(x, y, lb, tb, rb, bb, img_name) {
        var _this = _super.call(this, x, y, lb, tb, rb, bb) || this;
        _this.visible = true;
        _this.type = "GameSprite";
        _this.img_name = img_name;
        if (_this.img_name != undefined)
            _this.image = eval("resource_manager." + _this.img_name);
        else
            _this.image = null;
        _this.animation = new Animation(1, 8);
        return _this;
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
        ctx.drawImage(this.image, 
        //SOURCE RECTANGLE
        ani.frame_width * column + ani.frame_width * ani.abs_ani_x, ani.frame_height * row + ani.frame_height * ani.abs_ani_y, ani.frame_width, ani.frame_height, 
        //DESTINATION RECTANGLE
        ~~(this.x - camera.x + camera.screen_offset_x + 0.5) + ani.x_offset, ~~(this.y - camera.y + camera.screen_offset_y + 0.5) + ani.y_offset, ani.frame_width, ani.frame_height);
    };
    return GameSprite;
}(GameObject));
