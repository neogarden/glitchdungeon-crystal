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
var Slope = (function () {
    function Slope() {
    }
    return Slope;
}());
Slope.FLAT = 0;
Slope.LOW_POS = (Math.PI / 6);
Slope.MID_POS = (Math.PI / 4);
Slope.HI_POS = (Math.PI / 3);
Slope.LOW_NEG = -(Math.PI / 6);
Slope.MID_NEG = -(Math.PI / 4);
Slope.HI_NEG = -(Math.PI / 3);
var Tile = (function (_super) {
    __extends(Tile, _super);
    function Tile(x, y, collision, slope) {
        if (collision === void 0) { collision = Tile.GHOST; }
        if (slope === void 0) { slope = Slope.FLAT; }
        var _this = _super.call(this, x, y, 0, 0, Tile.WIDTH, Tile.HEIGHT) || this;
        _this.tileset_x = 0;
        _this.tileset_y = 0;
        _this.type = "Tile";
        _this.collision = collision;
        if (collision == Tile.KILL_PLAYER)
            _this.kill_player = true;
        _this.SetLRHeights();
        return _this;
    }
    Tile.prototype.Import = function (obj) {
        this.collision = obj.collision;
        this.slope = obj.slope;
        this.SetLRHeights();
        this.tileset_x = obj.tileset_x;
        this.tileset_y = obj.tileset_y;
    };
    Tile.prototype.Export = function () {
        return {
            collision: this.collision,
            slope: this.slope,
            tileset_x: this.tileset_x,
            tileset_y: this.tileset_y
        };
    };
    Tile.prototype.SetLRHeights = function () {
        //default to flat
        switch (this.slope) {
            case Slope.LOW_POS:
            case Slope.MID_POS:
            case Slope.HI_POS:
                this.l_height = Tile.HEIGHT;
                this.r_height = Tile.HEIGHT - (Math.tan(this.slope) * Tile.WIDTH);
                break;
            case Slope.LOW_NEG:
            case Slope.MID_NEG:
            case Slope.HI_NEG:
                this.l_height = Tile.HEIGHT - (Math.tan(this.slope) * Tile.WIDTH);
                this.r_height = Tile.HEIGHT;
                break;
            case Slope.FLAT:
                this.l_height = 0;
                this.r_height = 0;
            default: break;
        }
    };
    Tile.prototype.RenderFromImage = function (ctx, camera, image) {
        if (image === null && Tile.DISPLAY_TYPE !== Tile.COLLISION_DISPLAY)
            return;
        var row = this.tileset_y;
        var column = this.tileset_x;
        if (Tile.DISPLAY_TYPE === Tile.NORMAL_DISPLAY) {
            ctx.drawImage(image, 
            //SOURCE RECTANGLE
            Tile.WIDTH * column, Tile.HEIGHT * row, Tile.WIDTH, Tile.HEIGHT, 
            //DESTINATION RECTANGLE
            ~~(this.x - camera.x + camera.screen_offset_x + 0.5), ~~(this.y - camera.y + camera.screen_offset_y + 0.5), Tile.WIDTH, Tile.HEIGHT);
        }
        else if (Tile.DISPLAY_TYPE === Tile.COLLISION_DISPLAY) {
            switch (this.collision) {
                case Tile.GHOST:
                    ctx.fillStyle = "#000000";
                    break;
                default:
                case Tile.SOLID:
                    ctx.fillStyle = "#aaaaaa";
                    break;
                case Tile.FALLTHROUGH:
                    ctx.fillStyle = "#00ffff";
                    break;
                case Tile.KILL_PLAYER:
                    ctx.fillStyle = "#ff0000";
                    break;
                case Tile.SUPER_SOLID:
                    ctx.fillStyle = "#ffffff";
                    break;
            }
            ctx.fillRect(~~(this.x - camera.x + camera.screen_offset_x + 0.5), ~~(this.y - camera.y + camera.screen_offset_y + 0.5), Tile.WIDTH, Tile.HEIGHT);
        }
    };
    return Tile;
}(GameObject));
Tile.NORMAL_DISPLAY = 0;
Tile.COLLISION_DISPLAY = 1;
Tile.DISPLAY_TYPE = Tile.NORMAL_DISPLAY;
Tile.WIDTH = 16;
Tile.HEIGHT = 16;
Tile.GHOST = -1;
Tile.SOLID = 0;
Tile.FALLTHROUGH = 1;
Tile.KILL_PLAYER = 2;
Tile.SUPER_SOLID = 3;
