var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Collection = (function (_super) {
    __extends(Collection, _super);
    function Collection(x, y, collection_id) {
        _super.call(this, x, y, 2, 2, 14, 16, "collection_sheet");
        this.type = "Collection";
        this.collection_id = collection_id;
        this.animation.frame_delay = 30;
        this.UpdateAnimation();
        this.z_index = 8;
    }
    Collection.prototype.Load = function (obj) {
        _super.prototype.Load.call(this, obj);
        this.visible = obj.visible;
    };
    Collection.prototype.Save = function () {
        var obj = _super.prototype.Save.call(this);
        obj.visible = this.visible;
        return obj;
    };
    Collection.prototype.Import = function (obj) {
        _super.prototype.Import.call(this, obj);
        this.collection_id = obj.collection_id;
        var ani_x = Math.floor(this.collection_id / 6) * 2;
        var ani_y = this.collection_id % 6;
        this.animation.Change(ani_x, ani_y, 2);
    };
    Collection.prototype.Export = function () {
        var obj = _super.prototype.Export.call(this);
        obj.collection_id = this.collection_id;
        return obj;
    };
    Collection.prototype.ImportOptions = function (options) {
        this.collection_id = Number(options.collection_id.value);
        this.UpdateAnimation();
    };
    Collection.prototype.ExportOptions = function () {
        var options = {};
        options['collection_id'] = new TextDropdown(this.GetCollectionTypes(), this.collection_id);
        return options;
    };
    Collection.prototype.Update = function (map) {
        if (this.IsColliding(player) && this.visible) {
            this.visible = false;
            Utils.playSound("pickup", master_volume, 0);
            player.inventory.artifacts.push(this);
            room.Speak("item get: " + this.GetName(false), {
                speech_time: 240,
                avatar: this.getAvatar()
            });
            this.GetName(true);
        }
        this.UpdateAnimation();
        _super.prototype.Update.call(this, map);
    };
    Collection.prototype.getAvatar = function () {
        if (this.avatar === undefined || this.avatar === null) {
            var ani = this.animation;
            this.avatar = {
                image: this.image,
                src_rect: [
                    ani.abs_ani_x,
                    ani.abs_ani_y,
                    ani.frame_width,
                    ani.frame_height - 2,
                ]
            };
        }
        return this.avatar;
    };
    Collection.prototype.UpdateAnimation = function () {
        var ani_x = Math.floor(this.collection_id / 6) * 2;
        var ani_y = this.collection_id % 6;
        this.animation.Change(ani_x, ani_y, 2);
    };
    Collection.prototype.UpdateAnimationFromState = function () { };
    Collection.prototype.GetCollectionTypes = function () {
        var collection_types = [];
        var i = 0;
        var old_collection_id = this.collection_id;
        this.collection_id = i;
        var name = this.GetName(false);
        while (name !== undefined) {
            collection_types.push({ name: name, value: i });
            i++;
            this.collection_id = i;
            name = this.GetName(false);
        }
        this.collection_id = old_collection_id;
        return collection_types;
    };
    Collection.prototype.GetName = function (activate_event) {
        switch (this.collection_id) {
            case 0:
                if (activate_event)
                    this.GrimoireLvl1();
                return "grimoire lvl 1";
            case 1:
                if (activate_event)
                    this.FeatherSpell();
                return "feather spell";
            case 2:
                if (activate_event)
                    this.FloorSpell();
                return "floor spell";
            case 3:
                if (activate_event)
                    this.GravitySpell();
                return "gravity spell";
            case 4:
                if (activate_event)
                    this.WallSpell();
                return "wall spell";
            case 5:
                if (activate_event)
                    this.InvisSpell();
                return "invis spell";
            case 6:
                if (activate_event)
                    this.UndefinedSpell();
                return "undefined";
            case 7:
                if (activate_event)
                    this.MemorySpell();
                return "memory spell";
            case 8:
                if (activate_event)
                    this.GrimoireLvl0();
                return "grimoire lvl 0";
            case 9:
                if (activate_event)
                    this.RedCrystal();
                return "red crystal";
            case 10:
                if (activate_event)
                    this.GreenCrystal();
                return "green crystal";
            default: return undefined;
        }
    };
    Collection.prototype.GrimoireLvl0 = function () {
        player.inventory.spellbook.active = true;
        player.inventory.spellbook.level = 0;
    };
    Collection.prototype.GrimoireLvl1 = function () {
        player.inventory.spellbook.active = true;
        player.inventory.spellbook.level = 1;
        room.bg_code = "switch (Ǥlitch_type){\n\tcase Ǥlitch.ǤREY:\n\t\tbreak;\n\tcあse Ǥlitch.RED:\n\t\tǤlitch.RedTrあnsform(mあp, mあp.plあyer, normあlize);\n\t\tbreあk;\n\tcase Ǥlitch.ǤREEN:\n\t\tǤlitch.ǤreenTrあnsform(mあp, mあp.player, normあlize);\n\t\tbreあk;\n\tcase Ǥlitch.BLUE:";
        bg_name = "lhommeEraseForm";
        if (resource_manager.play_music) {
            stopMusic();
            startMusic();
        }
    };
    Collection.prototype.AddSpell = function (spell) {
        player.AddSpell(spell);
    };
    Collection.prototype.FeatherSpell = function () {
        this.AddSpell(Glitch.GREEN);
    };
    Collection.prototype.FloorSpell = function () {
        this.AddSpell(Glitch.RED);
    };
    Collection.prototype.GravitySpell = function () {
        this.AddSpell(Glitch.BLUE);
    };
    Collection.prototype.WallSpell = function () {
        this.AddSpell(Glitch.GOLD);
    };
    Collection.prototype.InvisSpell = function () {
        this.AddSpell(Glitch.ZERO);
    };
    Collection.prototype.UndefinedSpell = function () {
        this.AddSpell(Glitch.NEGATIVE);
        bg_name = "TomWoxom_North";
        if (resource_manager.play_music) {
            stopMusic();
            startMusic();
        }
    };
    Collection.prototype.MemorySpell = function () {
        Glitch.PinkTransform();
    };
    Collection.prototype.RedCrystal = function () {
        room.glitch_sequence = [Glitch.RED];
        Glitch.TransformPlayer(room, Glitch.RED);
    };
    Collection.prototype.GreenCrystal = function () {
        room.glitch_sequence = [Glitch.GREEN];
        Glitch.TransformPlayer(room, Glitch.GREEN);
    };
    return Collection;
}(GameSprite));
