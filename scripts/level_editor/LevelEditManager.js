var LevelEditManager = (function () {
    function LevelEditManager() {
        this.enabled = false;
        this.mouse_down = false;
        this.potential_entity = undefined;
        this.entity = undefined;
        this.entity_grav_acc = 0;
        this.object_is_tile = false;
        this.typing = false;
        this.ctx_menu_visible = false;
        this.ctx_menu_timer = 0;
        this.ctx_menu_time_limit = 3;
        this.offset_x = 0;
        this.offset_y = 0;
        this.tile_mode = false;
        this.tile_img_x = 0;
        this.tile_img_y = 0;
        this.level_main_name = "main";
        var tileset_canvas = document.getElementById("tileset_canvas");
        this.tileset_ctx = tileset_canvas.getContext("2d");
    }
    LevelEditManager.prototype.Init = function () {
        $("level_edit_buttons").style.display = "block";
        this.enabled = true;
        var zoom = 2;
        var canvas = $("tileset_canvas");
        var ctx = canvas.getContext("2d");
        ctx.canvas.width = 96 * zoom;
        ctx.canvas.height = 96 * zoom;
        ctx.scale(zoom, zoom);
        canvas.onmousedown = function (e) {
            var box = canvas.getBoundingClientRect();
            var x = (e.clientX - box.left) / 2;
            var y = (e.clientY - box.top) / 2;
            var tile_x = Math.floor(x / Tile.WIDTH);
            var tile_y = Math.floor(y / Tile.HEIGHT);
            this.setTileImg(tile_x, tile_y);
        }.bind(this);
    };
    LevelEditManager.prototype.setTileImg = function (tile_x, tile_y) {
        var canvas = $("tileset_canvas");
        var ctx = canvas.getContext("2d");
        this.tile_img_x = tile_x;
        this.tile_img_y = tile_y;
        canvas.width = canvas.width;
        var zoom = canvas.width / 96;
        ctx.fillStyle = "#222222";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        sharpen(ctx);
        ctx.drawImage(resource_manager[room.tilesheet_name], 0, 0, 96, 96, 0, 0, canvas.width, canvas.height);
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#ffffff";
        ctx.rect(tile_x * Tile.WIDTH * zoom, tile_y * Tile.HEIGHT * zoom, Tile.WIDTH * zoom, Tile.HEIGHT * zoom);
        ctx.stroke();
    };
    LevelEditManager.prototype.Disable = function () {
        $("level_edit_buttons").style.display = "none";
        this.enabled = false;
    };
    LevelEditManager.prototype.New = function () {
        room_manager.New();
    };
    LevelEditManager.prototype.Load = function () {
        var level_name = prompt("level name?");
        if (level_name === null || level_name === undefined)
            return;
        this.level_main_name = level_name;
        room_manager.Import(this.level_main_name, function () {
            room_manager.ChangeRoom();
        });
    };
    LevelEditManager.prototype.CreateContextMenu = function (mouse_x, mouse_y, x, y, tile_x, tile_y) {
        var ctx_menu = CtxMenu.Init(mouse_x, mouse_y, document.body);
        ctx_menu.Open();
        this.ctx_menu_visible = true;
        ctx_menu.AddItem("toggle tile mode", function () {
            if (Tile.DISPLAY_TYPE === Tile.NORMAL_DISPLAY)
                Tile.DISPLAY_TYPE = Tile.COLLISION_DISPLAY;
            else
                Tile.DISPLAY_TYPE = Tile.NORMAL_DISPLAY;
        }.bind(this));
        ctx_menu.AddDivider();
        ctx_menu.AddItem("Room properties", function () {
            room.paused = true;
            var options = room.GenerateOptions();
            level_edit_manager.typing = true;
            Dialog.Confirm("", options.submit, "edit room properties", "save", function () { room.paused = false; level_edit_manager.typing = false; });
            Dialog.AddElement(options.dom);
        }.bind(this));
        ctx_menu.AddDivider();
        var entity = room.GetEntityAtXY(x, y);
        var name = "";
        var index = 0;
        if (entity !== undefined) {
            name = entity.constructor.name;
            index = room.entities.indexOf(entity);
        }
        if (entity !== undefined) {
            ctx_menu.AddItem("edit " + name, function () {
                room.paused = true;
                var options = this.GenerateOptions();
                level_edit_manager.typing = true;
                Dialog.Confirm("", options.submit, "edit " + name, "edit", function () { room.paused = false; level_edit_manager.typing = false; });
                Dialog.AddElement(options.dom);
            }.bind(entity));
            ctx_menu.AddItem("delete " + name, function () {
                room.paused = true;
                Dialog.Confirm("are you sure you wish to delete this " + name + "?", function () { room.entities.splice(index, 1); }, "delete " + name, "delete", function () { room.paused = false; });
            }.bind(entity));
            ctx_menu.AddDivider();
        }
        var create_node = CtxMenu.InitNode(ctx_menu);
        var px = tile_x * Tile.WIDTH - 8;
        var py = tile_y * Tile.HEIGHT - 8;
        create_node.AddItem("new NPC", function () {
            room.paused = true;
            var npc = new NPC(px, py);
            var options = npc.GenerateOptions();
            level_edit_manager.typing = true;
            Dialog.Confirm("", function () {
                options.submit();
                room.entities.push(npc);
            }, "new NPC", "create", function () {
                room.paused = false;
                level_edit_manager.typing = false;
            });
            Dialog.AddElement(options.dom);
        }.bind(this));
        create_node.AddItem("new Checkpoint", function () {
            var checkpoint = new Checkpoint(px, py);
            room.entities.push(checkpoint);
        }.bind(this));
        create_node.AddItem("new Powerup", function () {
            room.paused = true;
            var powerup = new Collection(px, py, 0);
            var options = powerup.GenerateOptions();
            level_edit_manager.typing = true;
            Dialog.Confirm("", function () {
                options.submit();
                room.entities.push(powerup);
            }, "new Powerup", "create", function () {
                room.paused = false;
                level_edit_manager.typing = false;
            });
            Dialog.AddElement(options.dom);
        }.bind(this));
        create_node.AddItem("new Enemy", function () {
            room.paused = true;
            var enemy = new Enemy(px, py, 0);
            var options = enemy.GenerateOptions();
            level_edit_manager.typing = true;
            Dialog.Confirm("", function () {
                options.submit();
                room.entities.push(enemy);
            }, "new Enemy", "create", function () {
                room.paused = false;
                level_edit_manager.typing = false;
            });
            Dialog.AddElement(options.dom);
        }.bind(this));
        create_node.AddItem("new Door", function () {
            room.paused = true;
            var door = new Door(px, py, room_manager.room_index_x, room_manager.room_index_y, "id", false, 0);
            var options = door.GenerateOptions();
            level_edit_manager.typing = true;
            Dialog.Confirm("", function () {
                options.submit();
                room.entities.push(door);
            }, "new Door", "create", function () {
                room.paused = false;
                level_edit_manager.typing = false;
            });
            Dialog.AddElement(options.dom);
        }.bind(this));
        create_node.AddItem("new Switcher", function () {
            room.paused = true;
            var switcher = new Switcher(px, py);
            var options = switcher.GenerateOptions();
            level_edit_manager.typing = true;
            Dialog.Confirm("", function () {
                options.submit();
                room.entities.push(switcher);
            }, "new Switcher", "create", function () {
                room.paused = false;
                level_edit_manager.typing = false;
            });
            Dialog.AddElement(options.dom);
        }.bind(this));
        ctx_menu.AddNode("Create new...", create_node);
    };
    LevelEditManager.prototype.DrawGrid = function (ctx, room) {
        var color = "#000000";
        var ax = (-room.camera.x + room.camera.screen_offset_x) % Tile.WIDTH;
        var ay = (-room.camera.y + room.camera.screen_offset_y) % Tile.HEIGHT;
        for (var i = 1; i < ~~(GAME_WIDTH / Tile.WIDTH) + 1; i++) {
            drawLine(ctx, color, ax + i * Tile.WIDTH, 0, ax + i * Tile.WIDTH, room.SCREEN_HEIGHT, 0.5);
        }
        for (var i = 1; i < ~~(GAME_HEIGHT / Tile.HEIGHT) + 1; i++) {
            drawLine(ctx, color, 0, ay + i * Tile.HEIGHT, room.SCREEN_WIDTH, ay + i * Tile.HEIGHT, 0.5);
        }
    };
    LevelEditManager.prototype.TileSetMouseDown = function (e) {
        if (!level_edit)
            return;
        e.preventDefault();
        var box = $("tileset_canvas").getBoundingClientRect();
        var x = (e.clientX - box.left);
        var y = (e.clientY - box.top);
        var tile_x = Math.floor(x / Tile.WIDTH);
        var tile_y = Math.floor(y / Tile.HEIGHT);
        this.SetTileImage(tile_x, tile_y);
    };
    LevelEditManager.prototype.SetTileImage = function (tile_x, tile_y) {
        this.tile_img_x = tile_x;
        this.tile_img_y = tile_y;
        this.tileset_ctx.canvas.width = this.tileset_ctx.canvas.width;
        this.tileset_ctx.lineWidth = 1;
        this.tileset_ctx.strokeStyle = "#ffffff";
        this.tileset_ctx.rect(tile_x * Tile.WIDTH, tile_y * Tile.HEIGHT, Tile.WIDTH, Tile.HEIGHT);
        this.tileset_ctx.stroke();
    };
    LevelEditManager.prototype.MouseDown = function (e) {
        if (!this.enabled)
            return;
        e.preventDefault();
        this.mouse_down = true;
        var right_click = (e.which === 3 && e.button === 2);
        var box = canvas.getBoundingClientRect();
        var x = (e.clientX - box.left) / room.camera.view_scale + room.camera.x - room.camera.screen_offset_x;
        var y = (e.clientY - box.top) / room.camera.view_scale + room.camera.y - room.camera.screen_offset_y;
        var tile_x = Math.floor(x / Tile.WIDTH);
        var tile_y = Math.floor(y / Tile.HEIGHT);
        if (!right_click && this.potential_entity !== undefined) {
            this.entity = this.potential_entity;
            this.entity_grav_acc = this.entity['grav_acc'];
            this.entity['grav_acc'] = 0;
            var potential_level_edit_entity = undefined;
            document.body.style.cursor = "-webkit-grabbing";
            this.offset_x = this.entity.x - x;
            this.offset_y = this.entity.y - y;
        }
        var timer_callback = function () { };
        if (this.potential_entity === undefined) {
            timer_callback = function () {
                this.tile_mode = true;
                this.PlaceTile(tile_x, tile_y, right_click);
            }.bind(this);
        }
        if (right_click) {
            this.ctx_menu_timer = 0;
            this.ctx_menu_timer_id = setInterval(function () {
                this.ctx_menu_timer++;
                if (this.ctx_menu_timer >= this.ctx_menu_time_limit) {
                    timer_callback();
                    clearInterval(this.ctx_menu_timer_id);
                    this.ctx_menu_timer_id = undefined;
                }
            }.bind(this), 100);
        }
        else {
            if (!this.ctx_menu_visible)
                timer_callback();
            this.ctx_menu_visible = false;
        }
    };
    LevelEditManager.prototype.MouseMove = function (e) {
        if (!this.enabled || room === undefined)
            return;
        if (this.mouse_down && this.object_is_tile) {
            this.MouseDown(e);
            return;
        }
        var box = canvas.getBoundingClientRect();
        var x = (e.clientX - box.left) / room.camera.view_scale + room.camera.x - room.camera.screen_offset_x;
        var y = (e.clientY - box.top) / room.camera.view_scale + room.camera.y - room.camera.screen_offset_y;
        var tile_x = Math.floor(x / Tile.WIDTH);
        var tile_y = Math.floor(y / Tile.HEIGHT);
        if (this.tile_mode) {
            this.PlaceTile(tile_x, tile_y, (e.which === 3 || e.button === 2 || e.altKey));
        }
        var entity = room.GetEntityAtXY(x, y);
        if (this.entity === undefined) {
            document.body.style.cursor = "auto";
            this.potential_entity = undefined;
            if (entity !== undefined) {
                document.body.style.cursor = "-webkit-grab";
                this.potential_entity = entity;
            }
        }
        else {
            this.entity.x = ~~((x + this.offset_x) / (Tile.WIDTH / 2));
            this.entity.x *= (Tile.WIDTH / 2);
            this.entity.y = ~~((y + this.offset_y) / (Tile.HEIGHT / 2));
            this.entity.y *= (Tile.HEIGHT / 2);
            this.entity.original_x = this.entity.x;
            this.entity.original_y = this.entity.y;
        }
    };
    LevelEditManager.prototype.MouseUp = function (e) {
        if (!this.enabled)
            return;
        this.mouse_down = false;
        this.tile_mode = false;
        var right_click = (e.which === 3 && e.button === 2);
        var box = canvas.getBoundingClientRect();
        var mouse_x = e.clientX - box.left;
        var mouse_y = e.clientY - box.top;
        var x = mouse_x / room.camera.view_scale + room.camera.x - room.camera.screen_offset_x;
        var y = mouse_y / room.camera.view_scale + room.camera.y - room.camera.screen_offset_y;
        var tile_x = x / Tile.WIDTH;
        var tile_y = y / Tile.HEIGHT;
        if (this.entity !== undefined) {
            document.body['cursor'] = "auto";
            this.entity['grav_acc'] = this.entity_grav_acc;
            this.entity = undefined;
        }
        if (right_click && this.ctx_menu_timer < this.ctx_menu_time_limit) {
            this.CreateContextMenu(mouse_x, mouse_y, x, y, tile_x, tile_y);
        }
        if (this.ctx_menu_timer_id !== undefined) {
            clearInterval(this.ctx_menu_timer_id);
        }
        this.ctx_menu_timer_id = undefined;
    };
    LevelEditManager.prototype.PlaceTile = function (tile_x, tile_y, right_click) {
        var tile = room.tiles[tile_y][tile_x];
        tile.kill_player = false;
        tile.tileset_x = this.tile_img_x;
        tile.tileset_y = this.tile_img_y;
        if (right_click) {
            tile.collision = Tile.GHOST;
            tile.tileset_x = 0;
            tile.tileset_y = 0;
        }
        else {
            var collision = document.querySelector('input[name="collision"]:checked').value;
            tile.collision = eval(collision);
        }
    };
    LevelEditManager.prototype.ChangeRoomSize = function () {
        room.ChangeSize($("room_width").value, $("room_height").value);
    };
    LevelEditManager.prototype.ChangeGlitch = function () {
        room.glitch_sequence = [eval(this.getSelected("glitch_options"))];
        room.glitch_index = 0;
        room.glitch_type = room.glitch_sequence[0];
        Glitch.TransformPlayer(room, room.glitch_type);
    };
    LevelEditManager.prototype.AddGlitch = function () {
        room.glitch_sequence.push(eval(this.getSelected("glitch_options")));
        room.glitch_index = 0;
        room.glitch_time = 0;
    };
    LevelEditManager.prototype.ExportMain = function () {
        var lmn = this.level_main_name;
        Dialog.Confirm("this will overwrite current level: " + this.level_main_name + "<br/>MAKE SURE EVERYTHING IS OK", function () {
            level_edit_manager.Export(lmn, true);
        }, "save to " + this.level_main_name + "?", "YES, save");
    };
    LevelEditManager.prototype.Export = function (level_name, should_alert) {
        var path = "assets/rooms/" + level_name + "/";
        var json = room_manager.Export();
        FileManager.ensureExists(path, function (err) {
            try {
                if (err)
                    console.log(err);
                else {
                    for (var i = 0; i < json.rooms.length; i++) {
                        for (var j = 0; j < json.rooms[i].length; j++) {
                            var room = json.rooms[i][j];
                            var ikey = room.index_y;
                            var jkey = room.index_x;
                            FileManager.saveFile(path + jkey + "_" + ikey + ".json", JSON.stringify(room));
                        }
                    }
                    FileManager.saveFile(path + "etc.json", json.etc);
                    if (should_alert)
                        Dialog.Alert("level saved to file!");
                    return;
                }
            }
            catch (e) {
                console.log(e);
            }
            if (should_alert) {
                Dialog.Alert("error saving level!<br/>(check console for details)");
            }
        });
    };
    LevelEditManager.prototype.ResetRoom = function () {
        room = new Room();
        $("room_width").value = room.SCREEN_WIDTH;
        $("room_height").value = room.SCREEN_HEIGHT;
    };
    LevelEditManager.prototype.ResetLevel = function () {
        room_manager.Reset();
    };
    LevelEditManager.prototype.getSelected = function (drop_down) {
        var e = $(drop_down);
        return e.options[e.selectedIndex].value;
    };
    return LevelEditManager;
}());
