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
var Enemy = (function (_super) {
    __extends(Enemy, _super);
    function Enemy(x, y, enemy_id) {
        var _this = _super.call(this, x, y, 2, 2, 14, 16, "enemy_sheet") || this;
        _this.type = "Enemy";
        _this.kill_player = true;
        _this.enemy_id = enemy_id;
        _this.facing = Facing.LEFT;
        _this.original_facing = _this.facing;
        _this.max_run_vel = 1.5;
        _this.GlitchMe();
        return _this;
    }
    Enemy.prototype.Import = function (obj) {
        GameMover.prototype.Import.call(this, obj);
        this.enemy_id = obj.enemy_id;
        this.GlitchMe();
    };
    Enemy.prototype.Export = function () {
        var obj = GameMover.prototype.Export.call(this);
        obj.enemy_id = this.enemy_id;
        return obj;
    };
    Enemy.prototype.ImportOptions = function (options) {
        this.enemy_id = Number(options.enemy_id.value);
        this.GlitchMe();
    };
    Enemy.prototype.ExportOptions = function () {
        var options = {};
        options['enemy_id'] = new TextDropdown([
            { name: "enemy", value: 0 },
            { name: "floating enemy", value: 1 }
        ], this.enemy_id);
        return options;
    };
    Enemy.prototype.GlitchMe = function () {
        if (this.enemy_id === 1) {
            this.ApplyGravity = function () { };
            this.HandleHorizontalCollisions = function () { };
            this.HandleVerticalCollisions = function () { };
        }
        else if (this.enemy_id === 0) {
            this.ApplyGravity = GameMover.prototype.ApplyGravity;
            this.HandleHorizontalCollisions = GameMover.prototype.HandleHorizontalCollisions;
            this.HandleVerticalCollisions = GameMover.prototype.HandleVerticalCollisions;
        }
    };
    Enemy.prototype.Update = function (map) {
        if (this.facing == Facing.LEFT) {
            this.vel.x = -this.max_run_vel;
        }
        else {
            this.vel.x = this.max_run_vel;
        }
        GameMover.prototype.Update.call(this, map);
        if (this.horizontal_collision) {
            if (this.facing == Facing.LEFT)
                this.facing = Facing.RIGHT;
            else
                this.facing = Facing.LEFT;
        }
        if (this.enemy_id === 1) {
            if (this.x < 0) {
                this.facing = Facing.RIGHT;
            }
            if (this.x + this.rb > map.MAP_WIDTH * Tile.WIDTH) {
                this.facing = Facing.LEFT;
            }
        }
        if (this.enemy_id === null || this.enemy_id === undefined) {
            this.delete_me = true;
        }
    };
    Enemy.prototype.UpdateAnimationFromState = function () {
        var ani_x = 0;
        var ani_y = this.enemy_id;
        this.animation.Change(ani_x, ani_y, 6);
        if (this.facing === Facing.LEFT) {
            this.animation.abs_ani_y = 2 * this.animation.frame_height;
        }
        else if (this.facing === Facing.RIGHT) {
            this.animation.abs_ani_y = 0;
        }
        this.prev_move_state = this.move_state;
    };
    return Enemy;
}(GameMover));
