var Utils = (function () {
    function Utils() {
    }
    Utils.gup = function (name) {
        name = RegExp('[?&]' + name.replace(/([[\]])/, '\\$1') + '=([^&#]*)');
        return (window.location.href.match(name) || ['', ''])[1];
    };
    Utils.playSound = function (sound_name, volume, time, loop) {
        if (volume === void 0) { volume = 1.0; }
        if (time === void 0) { time = 0; }
        if (loop === void 0) { loop = false; }
        tryToPlay = null;
        loop = loop;
        if (!resource_manager.can_play_sound || (!resource_manager.play_sound || (!resource_manager.play_music && loop)))
            return;
        if (loop) {
            if (resource_manager[sound_name] === undefined || resource_manager[sound_name] === null) {
                tryToPlay = window.setTimeout(function () { bg_music = Utils.playSound(sound_name, volume, time, loop); }, 100);
                return;
            }
        }
        if (!resource_manager[sound_name])
            return;
        var source = resource_manager.audio_context.createBufferSource();
        source.buffer = resource_manager[sound_name];
        source.loop = loop;
        var v = volume;
        var gain_node = resource_manager.audio_context.createGain();
        source.connect(gain_node);
        gain_node.connect(resource_manager.audio_context.destination);
        gain_node.gain.value = v;
        var t = time;
        if (source.start)
            source.start(t);
        else
            source.noteOn(t);
        return source;
    };
    return Utils;
}());
function readTextFile(file) {
    var text = null;
    var rawFile = new XMLHttpRequest();
    try {
        rawFile.open("GET", file, false);
        rawFile.onreadystatechange = function () {
            if (rawFile.readyState === 4) {
                if (rawFile.status === 200 || rawFile.status == 0) {
                    text = rawFile.responseText;
                }
            }
        };
        rawFile.send(null);
    }
    catch (e) {
        console.log(e);
    }
    return text;
}
function readTextFileAsync(file, callback) {
    var rawFile = new XMLHttpRequest();
    try {
        rawFile.open("GET", file, true);
        rawFile.onreadystatechange = function () {
            if (rawFile.readyState === 4) {
                if (rawFile.status === 200 || rawFile.status == 0) {
                    callback(rawFile.responseText);
                }
            }
        };
        rawFile.send(null);
    }
    catch (e) {
    }
}
function getElementsByClass(matchClass) {
    var elems = document.getElementsByTagName('*'), i;
    var class_objects = [];
    for (i in elems) {
        if ((' ' + elems[i].className + ' ').indexOf(' ' + matchClass + ' ')
            > -1) {
            class_objects.push(elems[i]);
        }
    }
    return class_objects;
}
function extend(base, sub) {
    var origProto = sub.prototype;
    sub.prototype = Object.create(base.prototype);
    for (var key in origProto) {
        sub.prototype[key] = origProto[key];
    }
    sub.prototype.constructor = sub;
    Object.defineProperty(sub.prototype, 'constructor', {
        enumerable: false,
        value: sub
    });
    sub.prototype.Parent = function () { return base.prototype; };
}
function $(id) {
    return document.getElementById(id);
}
function defaultValue(variable, def_val) {
    return typeof variable !== 'undefined' ? variable : def_val;
}
function sharpen(ctx) {
    ctx.imageSmoothingEnabled = false;
    ctx.mozImageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;
}
function drawLine(ctx, color, x1, y1, x2, y2, thickness, cap) {
    if (cap === void 0) { cap = undefined; }
    cap = cap || "round";
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineWidth = thickness;
    ctx.strokeStyle = color;
    ctx.lineCap = cap;
    ctx.stroke();
}
function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}
function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}
function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}
