var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var txt;
(function (txt) {
    var Text = (function (_super) {
        __extends(Text, _super);
        function Text(props) {
            if (props === void 0) { props = null; }
            _super.call(this);
            this.text = "";
            this.lineHeight = null;
            this.width = 100;
            this.height = 20;
            this.align = txt.Align.TOP_LEFT;
            this.characterCase = txt.Case.NORMAL;
            this.size = 12;
            this.font = "belinda";
            this.spacing = 0;
            this.ligatures = false;
            this.fillColor = "#000";
            this.strokeColor = null;
            this.strokeWidth = null;
            this.loaderId = null;
            this.style = null;
            this.debug = false;
            this.words = [];
            this.lines = [];
            if (props) {
                this.set(props);
            }
            if (this.style == null) {
                txt.FontLoader.load(this, [this.font]);
            }
            else {
                var fonts = [this.font];
                var styleLength = this.style.length;
                for (var i = 0; i < styleLength; ++i) {
                    if (this.style[i] != undefined) {
                        if (this.style[i].font != undefined) {
                            fonts.push(this.style[i].font);
                        }
                    }
                }
                txt.FontLoader.load(this, fonts);
            }
        }
        Text.prototype.render = function () {
            this.getStage().update();
        };
        Text.prototype.complete = function () {
        };
        Text.prototype.fontLoaded = function (font) {
            this.layout();
        };
        Text.prototype.layout = function () {
            this.text = this.text.replace(/([\n][ \t]+)/g, '\n');
            this.words = [];
            this.lines = [];
            this.removeAllChildren();
            if (this.debug == true) {
                var s = new createjs.Shape();
                s.graphics.beginStroke("#FF0000");
                s.graphics.setStrokeStyle(0.2);
                s.graphics.drawRect(0, 0, this.width, this.height);
                this.addChild(s);
            }
            if (this.text === "" || this.text === undefined) {
                this.render();
                this.complete();
                return;
            }
            this.block = new createjs.Container();
            this.addChild(this.block);
            if (this.characterLayout() === false) {
                this.removeAllChildren();
                return;
            }
            this.wordLayout();
            this.lineLayout();
            this.render();
            this.complete();
        };
        Text.prototype.characterLayout = function () {
            var len = this.text.length;
            var char;
            var defaultStyle = {
                size: this.size,
                font: this.font,
                spacing: this.spacing,
                characterCase: this.characterCase,
                fillColor: this.fillColor,
                strokeColor: this.strokeColor,
                strokeWidth: this.strokeWidth
            };
            var currentStyle = defaultStyle;
            var hPosition = 0;
            var vPosition = 0;
            var charKern;
            var spacing;
            var currentWord = new txt.Word();
            this.words.push(currentWord);
            for (var i = 0; i < len; i++) {
                if (this.style !== null && this.style[i] !== undefined) {
                    currentStyle = this.style[i];
                    if (currentStyle.size === undefined)
                        currentStyle.size = defaultStyle.size;
                    if (currentStyle.font === undefined)
                        currentStyle.font = defaultStyle.font;
                    if (currentStyle.spacing === undefined)
                        currentStyle.spacing = defaultStyle.spacing;
                    if (currentStyle.characterCase === undefined)
                        currentStyle.characterCase = defaultStyle.characterCase;
                    if (currentStyle.fillColor === undefined)
                        currentStyle.fillColor = defaultStyle.fillColor;
                    if (currentStyle.strokeColor === undefined)
                        currentStyle.strokeColor = defaultStyle.strokeColor;
                    if (currentStyle.strokeWidth === undefined)
                        currentStyle.strokeWidth = defaultStyle.strokeWidth;
                }
                if (this.text.charAt(i) == "\n") {
                    if (i < len - 1) {
                        currentWord.measuredWidth = hPosition;
                        currentWord.measuredHeight = vPosition;
                        if (currentWord.measuredHeight == 0) {
                            currentWord.measuredHeight = currentStyle.size;
                        }
                        currentWord.hasNewLine = true;
                        currentWord = new txt.Word();
                        this.words.push(currentWord);
                        vPosition = 0;
                        hPosition = 0;
                    }
                    continue;
                }
                if (txt.FontLoader.isLoaded(currentStyle.font) === false) {
                    txt.FontLoader.load(this, [currentStyle.font]);
                    return false;
                }
                char = new txt.Character(this.text.charAt(i), currentStyle, i);
                if (char.measuredHeight > vPosition) {
                    vPosition = char.measuredHeight;
                }
                if (currentStyle.spacing == 0 && this.ligatures == true) {
                    var ligTarget = this.text.substr(i, 4);
                    if (char._font.ligatures[ligTarget.charAt(0)]) {
                        if (char._font.ligatures[ligTarget.charAt(0)][ligTarget.charAt(1)]) {
                            if (char._font.ligatures[ligTarget.charAt(0)][ligTarget.charAt(1)][ligTarget.charAt(2)]) {
                                if (char._font.ligatures[ligTarget.charAt(0)][ligTarget.charAt(1)][ligTarget.charAt(2)][ligTarget.charAt(3)]) {
                                    char.setGlyph(char._font.ligatures[ligTarget.charAt(0)][ligTarget.charAt(1)][ligTarget.charAt(2)][ligTarget.charAt(3)].glyph);
                                    i = i + 3;
                                }
                                else {
                                    char.setGlyph(char._font.ligatures[ligTarget.charAt(0)][ligTarget.charAt(1)][ligTarget.charAt(2)].glyph);
                                    i = i + 2;
                                }
                            }
                            else {
                                char.setGlyph(char._font.ligatures[ligTarget.charAt(0)][ligTarget.charAt(1)].glyph);
                                i = i + 1;
                            }
                        }
                    }
                }
                char.x = hPosition;
                currentWord.addChild(char);
                if (this.text.charAt(i) == " ") {
                    currentWord.hasSpace = true;
                    currentWord.spaceOffset = (char._glyph.offset * char.size);
                    hPosition = char.x + (char._glyph.offset * char.size) + char.characterCaseOffset + (char.spacing / char._font.units * char.size) + char._glyph.getKerning(this.text.charCodeAt(i + 1), char.size);
                    currentWord.measuredWidth = hPosition;
                    currentWord.measuredHeight = vPosition;
                    hPosition = 0;
                    vPosition = 0;
                    currentWord = new txt.Word();
                    this.words.push(currentWord);
                    continue;
                }
                if (this.text.charAt(i) == "-") {
                    currentWord.hasHyphen = true;
                }
                hPosition = char.x + (char._glyph.offset * char.size) + char.characterCaseOffset + (char.spacing / char._font.units * char.size) + char._glyph.getKerning(this.text.charCodeAt(i + 1), char.size);
            }
            if (currentWord.children.length == 0) {
                var lw = this.words.pop();
                currentWord = this.words[this.words.length - 1];
                hPosition = currentWord.measuredWidth;
                vPosition = currentWord.measuredHeight;
            }
            currentWord.measuredWidth = hPosition;
            currentWord.measuredHeight = vPosition;
            return true;
        };
        Text.prototype.wordLayout = function () {
            var len = this.words.length;
            var currentLine = new txt.Line();
            this.lines.push(currentLine);
            currentLine.y = 0;
            var currentWord;
            var lastHeight;
            this.block.addChild(currentLine);
            var hPosition = 0;
            var vPosition = 0;
            var firstLine = true;
            var lastLineWord;
            for (var i = 0; i < len; i++) {
                currentWord = this.words[i];
                currentWord.x = hPosition;
                if (firstLine) {
                    vPosition = currentWord.measuredHeight;
                }
                else if (this.lineHeight != null) {
                    vPosition = this.lineHeight;
                }
                else if (currentWord.measuredHeight > vPosition) {
                    vPosition = currentWord.measuredHeight;
                }
                if (hPosition + currentWord.measuredWidth > this.width && currentWord.hasNewLine == true) {
                    if (this.lineHeight != null) {
                        lastHeight = currentLine.y + this.lineHeight;
                    }
                    else {
                        lastHeight = currentLine.y + vPosition;
                    }
                    currentLine.measuredWidth = hPosition;
                    lastLineWord = this.words[i - 1];
                    if (lastLineWord != undefined && lastLineWord.hasSpace) {
                        currentLine.measuredWidth -= lastLineWord.spaceOffset;
                    }
                    currentLine.measuredHeight = vPosition;
                    firstLine = false;
                    currentLine = new txt.Line();
                    this.lines.push(currentLine);
                    currentLine.y = lastHeight;
                    hPosition = 0;
                    currentWord.x = 0;
                    this.block.addChild(currentLine);
                    var swapWord = this.words[i];
                    currentLine.addChild(swapWord);
                    currentLine.measuredHeight = swapWord.measuredHeight;
                    currentLine.measuredWidth = swapWord.measuredWidth;
                    currentLine = new txt.Line();
                    this.lines.push(currentLine);
                    currentLine.y = lastHeight + vPosition;
                    this.block.addChild(currentLine);
                    if (i < len - 1) {
                        vPosition = 0;
                    }
                    continue;
                }
                else if (hPosition + currentWord.measuredWidth > this.width && i > 0) {
                    if (this.lineHeight != null) {
                        lastHeight = currentLine.y + this.lineHeight;
                    }
                    else {
                        lastHeight = currentLine.y + vPosition;
                    }
                    currentLine.measuredWidth = hPosition;
                    lastLineWord = this.words[i - 1];
                    if (lastLineWord != undefined && lastLineWord.hasSpace) {
                        currentLine.measuredWidth -= lastLineWord.spaceOffset;
                    }
                    currentLine.measuredHeight = vPosition;
                    firstLine = false;
                    currentLine = new txt.Line();
                    this.lines.push(currentLine);
                    currentLine.y = lastHeight;
                    if (i < len - 1) {
                        vPosition = 0;
                    }
                    hPosition = 0;
                    currentWord.x = hPosition;
                    this.block.addChild(currentLine);
                }
                else if (currentWord.hasNewLine == true) {
                    if (this.lineHeight != null) {
                        lastHeight = currentLine.y + this.lineHeight;
                    }
                    else {
                        lastHeight = currentLine.y + vPosition;
                    }
                    currentLine.measuredWidth = hPosition + currentWord.measuredWidth;
                    currentLine.measuredHeight = vPosition;
                    currentLine.addChild(this.words[i]);
                    firstLine = false;
                    currentLine = new txt.Line();
                    this.lines.push(currentLine);
                    currentLine.y = lastHeight;
                    if (i < len - 1) {
                        vPosition = 0;
                    }
                    hPosition = 0;
                    this.block.addChild(currentLine);
                    continue;
                }
                hPosition = hPosition + currentWord.measuredWidth;
                currentLine.addChild(this.words[i]);
            }
            if (currentLine.children.length == 0) {
                var lw = this.lines.pop();
                currentLine = this.lines[this.lines.length - 1];
            }
            currentLine.measuredWidth = hPosition;
            currentLine.measuredHeight = vPosition;
        };
        Text.prototype.lineLayout = function () {
            var blockHeight = 0;
            var measuredWidth = 0;
            var measuredHeight = 0;
            var line;
            var a = txt.Align;
            var fnt = txt.FontLoader.getFont(this.font);
            var aHeight = this.size * fnt.ascent / fnt.units;
            var cHeight = this.size * fnt['cap-height'] / fnt.units;
            var xHeight = this.size * fnt['x-height'] / fnt.units;
            var dHeight = this.size * fnt.descent / fnt.units;
            var lastCharOffset = 0;
            var len = this.lines.length;
            for (var i = 0; i < len; i++) {
                line = this.lines[i];
                measuredHeight += line.measuredHeight;
                if (this.align === a.TOP_CENTER) {
                    line.x = (this.width - line.measuredWidth) / 2;
                }
                else if (this.align === a.TOP_RIGHT) {
                    line.x = (this.width - line.measuredWidth);
                }
                else if (this.align === a.MIDDLE_CENTER) {
                    line.x = (this.width - line.measuredWidth) / 2;
                }
                else if (this.align === a.MIDDLE_RIGHT) {
                    line.x = (this.width - line.measuredWidth);
                }
                else if (this.align === a.BOTTOM_CENTER) {
                    line.x = (this.width - line.measuredWidth) / 2;
                }
                else if (this.align === a.BOTTOM_RIGHT) {
                    line.x = (this.width - line.measuredWidth);
                }
            }
            if (this.align === a.TOP_LEFT || this.align === a.TOP_CENTER || this.align === a.TOP_RIGHT) {
                this.block.y = this.lines[0].measuredHeight * fnt.ascent / fnt.units + this.lines[0].measuredHeight * fnt.top / fnt.units;
            }
            else if (this.align === a.MIDDLE_LEFT || this.align === a.MIDDLE_CENTER || this.align === a.MIDDLE_RIGHT) {
                this.block.y = this.lines[0].measuredHeight + (this.height - measuredHeight) / 2 + this.lines[0].measuredHeight * fnt.middle / fnt.units;
            }
            else if (this.align === a.BOTTOM_LEFT || this.align === a.BOTTOM_CENTER || this.align === a.BOTTOM_RIGHT) {
                this.block.y = this.height - this.lines[this.lines.length - 1].y + this.lines[0].measuredHeight * fnt.bottom / fnt.units;
            }
        };
        return Text;
    })(createjs.Container);
    txt.Text = Text;
})(txt || (txt = {}));
var txt;
(function (txt) {
    var Character = (function (_super) {
        __extends(Character, _super);
        function Character(character, style, index, glyph) {
            if (index === void 0) { index = null; }
            if (glyph === void 0) { glyph = null; }
            _super.call(this);
            this.character = '';
            this.characterCode = null;
            this.font = null;
            this.spacing = null;
            this.characterCase = null;
            this.characterCaseOffset = 0;
            this.index = null;
            this.size = null;
            this.fillColor = null;
            this.strokeColor = null;
            this.strokeWidth = null;
            this.measuredWidth = null;
            this.measuredHeight = null;
            this.hPosition = null;
            this.set(style);
            this.index = index;
            if (this.characterCase == txt.Case.NORMAL) {
                this.character = character;
            }
            else if (this.characterCase == txt.Case.UPPER) {
                this.character = character.toUpperCase();
            }
            else if (this.characterCase == txt.Case.LOWER) {
                this.character = character.toLowerCase();
            }
            else if (this.characterCase == txt.Case.SMALL_CAPS) {
                this.character = character.toUpperCase();
                var upperSmall = !(character === this.character);
            }
            else {
                this.character = character;
            }
            this.characterCode = this.character.charCodeAt(0);
            this._font = txt.FontLoader.getFont(this.font);
            if (this._font.glyphs[this.characterCode]) {
                this._glyph = this._font.glyphs[this.characterCode];
            }
            else if (this._font.glyphs[String.fromCharCode(this.characterCode).toLowerCase().charCodeAt(0)]) {
                this._glyph = this._font.glyphs[String.fromCharCode(this.characterCode).toLowerCase().charCodeAt(0)];
            }
            else if (this._font.glyphs[String.fromCharCode(this.characterCode).toUpperCase().charCodeAt(0)]) {
                this._glyph = this._font.glyphs[String.fromCharCode(this.characterCode).toUpperCase().charCodeAt(0)];
            }
            if (this._glyph === undefined) {
                this._glyph = this._font.glyphs[42];
            }
            this.graphics = this._glyph.graphic();
            if (this.characterCase === txt.Case.SMALL_CAPS) {
                if (upperSmall) {
                    this.scaleX = this.size / this._font.units * 0.8;
                    this.characterCaseOffset = -0.2 * (this._glyph.offset * this.size);
                }
                else {
                    this.scaleX = this.size / this._font.units;
                }
            }
            else {
                this.scaleX = this.size / this._font.units;
            }
            this.scaleY = -this.scaleX;
            this.measuredHeight = (this._font.ascent - this._font.descent) * this.scaleX;
            this.measuredWidth = this.scaleX * this._glyph.offset * this._font.units;
            var ha = new createjs.Shape();
            ha.graphics.drawRect(0, this._font.descent, this._glyph.offset * this._font.units, this._font.ascent - this._font.descent);
            this.hitArea = ha;
        }
        Character.prototype.setGlyph = function (glyph) {
            this._glyph = glyph;
            this.graphics = this._glyph.graphic();
        };
        Character.prototype.spacingOffset = function () {
            var unitSpacingFactor = 0;
            if (this._font.units > 1000) {
                unitSpacingFactor = (this._font.units - 1000) / 250;
            }
            return this._font.units / 1000 * (this.spacing + unitSpacingFactor) / this._font.units * this.size;
        };
        Character.prototype.draw = function (ctx) {
            this._glyph._fill.style = this.fillColor;
            this._glyph._fill.matrix = null;
            this._glyph._stroke.style = this.strokeColor;
            this._glyph._strokeStyle.width = this.strokeWidth;
            return this._glyph.draw(ctx);
        };
        Character.prototype.getWidth = function () {
            return this.size * this._glyph.offset;
        };
        return Character;
    })(createjs.Shape);
    txt.Character = Character;
})(txt || (txt = {}));
var txt;
(function (txt) {
    var Font = (function () {
        function Font() {
            this.glyphs = {};
            this.kerning = {};
            this.top = 0;
            this.middle = 0;
            this.bottom = 0;
            this.units = 1000;
            this.ligatures = {};
            this.loaded = false;
            this.targets = [];
        }
        Font.prototype.cloneGlyph = function (target, from) {
            if (this.glyphs[target] == undefined && this.glyphs[from] != undefined) {
                this.glyphs[target] = this.glyphs[from];
                this.kerning[target] = this.kerning[from];
            }
        };
        return Font;
    })();
    txt.Font = Font;
})(txt || (txt = {}));
var txt;
(function (txt) {
    var Glyph = (function () {
        function Glyph() {
            this.path = "";
            this.kerning = {};
            this._graphic = null;
        }
        Glyph.prototype.graphic = function () {
            if (this._graphic == null) {
                this._graphic = new createjs.Graphics();
                this._stroke = new createjs.Graphics.Stroke(null, true);
                this._strokeStyle = new createjs.Graphics.StrokeStyle(0);
                this._fill = new createjs.Graphics.Fill(null);
                this._graphic.decodeSVGPath(this.path);
                this._graphic.append(this._fill);
                this._graphic.append(this._strokeStyle);
                this._graphic.append(this._stroke);
            }
            return this._graphic;
        };
        Glyph.prototype.draw = function (ctx) {
            this._graphic.draw(ctx);
            return true;
        };
        Glyph.prototype.getKerning = function (characterCode, size) {
            if (this.kerning[characterCode] != undefined) {
                return -(this.kerning[characterCode] * size);
            }
            return 0;
        };
        return Glyph;
    })();
    txt.Glyph = Glyph;
})(txt || (txt = {}));
var txt;
(function (txt) {
    var FontLoader = (function () {
        function FontLoader() {
        }
        FontLoader.isLoaded = function (name) {
            if (txt.FontLoader.fonts.hasOwnProperty(name)) {
                return txt.FontLoader.fonts[name].loaded;
            }
            return false;
        };
        FontLoader.getFont = function (name) {
            if (txt.FontLoader.fonts.hasOwnProperty(name)) {
                return txt.FontLoader.fonts[name];
            }
            return null;
        };
        FontLoader.load = function (target, fonts) {
            var loader;
            if (target.loaderId == null) {
                loader = {};
                target.loaderId = txt.FontLoader.loaders.push(loader) - 1;
                loader._id = target.loaderId;
                loader._target = target;
            }
            else {
                loader = txt.FontLoader.loaders[target.loaderId];
            }
            var fontCount = fonts.length;
            for (var i = 0; i < fontCount; ++i) {
                loader[fonts[i]] = false;
            }
            for (var prop in loader) {
                if (prop.charAt(0) != "_") {
                    txt.FontLoader.loadFont(prop, loader);
                }
            }
        };
        FontLoader.check = function (id) {
            var loader = txt.FontLoader.loaders[id];
            for (var prop in loader) {
                if (prop.charAt(0) != "_") {
                    loader[prop] = txt.FontLoader.isLoaded(prop);
                    if (loader[prop] == false)
                        return;
                }
            }
            window.setTimeout(function () {
                loader._target.fontLoaded();
            }, 1);
        };
        FontLoader.loadFont = function (fontName, loader) {
            var fonts = txt.FontLoader.fonts;
            if (txt.FontLoader.fonts.hasOwnProperty(fontName)) {
                if (txt.FontLoader.fonts[fontName].loaded === true) {
                    txt.FontLoader.check(loader._id);
                }
                else {
                    txt.FontLoader.fonts[fontName].targets.push(loader._id);
                }
            }
            else {
                var font = txt.FontLoader.fonts[fontName] = new txt.Font();
                font.targets.push(loader._id);
                var req = new XMLHttpRequest();
                req.onload = function () {
                    var lines = this.responseText.split('\n');
                    var len = lines.length;
                    var i = 0;
                    var line;
                    var glyph;
                    while (i < len) {
                        line = lines[i].split("|");
                        switch (line[0]) {
                            case '0':
                                if (line[1] == 'id' || line[1] == 'panose' || line[1] == 'family' || line[1] == 'font-style' || line[1] == 'font-stretch') {
                                    font[line[1]] = line[2];
                                }
                                else {
                                    font[line[1]] = parseInt(line[2]);
                                }
                                break;
                            case '1':
                                glyph = new txt.Glyph();
                                glyph.offset = parseInt(line[2]) / font.units;
                                glyph.path = line[3];
                                font.glyphs[line[1]] = glyph;
                                break;
                            case '2':
                                if (font.kerning[line[1]] == undefined) {
                                    font.kerning[line[1]] = {};
                                }
                                if (font.glyphs[line[1]] == undefined) {
                                    glyph = new txt.Glyph();
                                    glyph.offset = font.default / font.units;
                                    glyph.path = '';
                                    font.glyphs[line[1]] = glyph;
                                }
                                font.glyphs[line[1]].kerning[line[2]] = parseInt(line[3]) / font.units;
                                font.kerning[line[1]][line[2]] = parseInt(line[3]) / font.units;
                                break;
                            case '3':
                                line.shift();
                                var lineLen = line.length;
                                for (var j = 0; j < lineLen; j++) {
                                    var path = line[j].split("");
                                    var pathLength = path.length;
                                    var target = font.ligatures;
                                    for (var k = 0; k < pathLength; k++) {
                                        if (target[path[k]] == undefined) {
                                            target[path[k]] = {};
                                        }
                                        if (k == pathLength - 1) {
                                            target[path[k]].glyph = font.glyphs[line[j]];
                                        }
                                        target = target[path[k]];
                                    }
                                }
                                break;
                        }
                        i++;
                    }
                    font.cloneGlyph(183, 8226);
                    font.cloneGlyph(8729, 8226);
                    font.cloneGlyph(12539, 8226);
                    font.cloneGlyph(9702, 8226);
                    font.cloneGlyph(9679, 8226);
                    font.cloneGlyph(9675, 8226);
                    if (font.top == undefined) {
                        font.top = 0;
                    }
                    if (font.middle == undefined) {
                        font.middle = 0;
                    }
                    if (font.bottom == undefined) {
                        font.bottom = 0;
                    }
                    var lLen = font.targets.length;
                    font.loaded = true;
                    for (var l = 0; l < lLen; ++l) {
                        txt.FontLoader.check(font.targets[l]);
                    }
                    font.targets = [];
                };
                req.open("get", txt.FontLoader.path + fontName.split(" ").join('_') + '.txt', true);
                req.send();
            }
        };
        FontLoader.path = "/font/";
        FontLoader.fonts = {};
        FontLoader.loaders = [];
        return FontLoader;
    })();
    txt.FontLoader = FontLoader;
})(txt || (txt = {}));
createjs.Graphics.prototype.decodeSVGPath = function (data) {
    txt.Graphics.init(this, data);
    return this;
};
var txt;
(function (txt) {
    var Graphics = (function () {
        function Graphics() {
        }
        Graphics.init = function (target, svgpath) {
            var ca = Graphics.parsePathData(svgpath);
            var G = createjs.Graphics;
            var closedPath = false;
            for (var n = 0; n < ca.length; n++) {
                var c = ca[n].command;
                var p = ca[n].points;
                switch (c) {
                    case 'L':
                        target.append(new G.LineTo(p[0], p[1]));
                        break;
                    case 'M':
                        target.append(new G.MoveTo(p[0], p[1]));
                        break;
                    case 'C':
                        target.append(new G.BezierCurveTo(p[0], p[1], p[2], p[3], p[4], p[5]));
                        break;
                    case 'Q':
                        target.append(new G.QuadraticCurveTo(p[0], p[1], p[2], p[3]));
                        break;
                    case 'A':
                        target.append(new G.SVGArc(p[0], p[1], p[2], p[3], p[4], p[5], p[6]));
                        break;
                    case 'Z':
                        target.append(new G.ClosePath());
                        target.append(new G.MoveTo(p[0], p[1]));
                        break;
                }
            }
        };
        Graphics.parsePathData = function (data) {
            if (!data) {
                return [];
            }
            var cs = data;
            var cc = ['m', 'M', 'l', 'L', 'v', 'V', 'h', 'H', 'z', 'Z', 'c', 'C', 'q', 'Q', 't', 'T', 's', 'S', 'a', 'A'];
            cs = cs.replace(new RegExp(' ', 'g'), ',');
            for (var n = 0; n < cc.length; n++) {
                cs = cs.replace(new RegExp(cc[n], 'g'), '|' + cc[n]);
            }
            var arr = cs.split('|');
            var ca = [];
            var cpx = 0;
            var cpy = 0;
            var arrLength = arr.length;
            var startPoint = null;
            for (n = 1; n < arrLength; n++) {
                var str = arr[n];
                var c = str.charAt(0);
                str = str.slice(1);
                str = str.replace(new RegExp(',-', 'g'), '-');
                str = str.replace(new RegExp('-', 'g'), ',-');
                str = str.replace(new RegExp('e,-', 'g'), 'e-');
                var p = str.split(',');
                if (p.length > 0 && p[0] === '') {
                    p.shift();
                }
                var pLength = p.length;
                for (var i = 0; i < pLength; i++) {
                    p[i] = parseFloat(p[i]);
                }
                if (c === 'z' || c === 'Z') {
                    p = [true];
                }
                while (p.length > 0) {
                    if (isNaN(p[0])) {
                        break;
                    }
                    var cmd = null;
                    var points = [];
                    var startX = cpx, startY = cpy;
                    var prevCmd, ctlPtx, ctlPty;
                    var rx, ry, psi, fa, fs, x1, y1;
                    switch (c) {
                        case 'l':
                            cpx += p.shift();
                            cpy += p.shift();
                            cmd = 'L';
                            points.push(cpx, cpy);
                            break;
                        case 'L':
                            cpx = p.shift();
                            cpy = p.shift();
                            points.push(cpx, cpy);
                            break;
                        case 'm':
                            var dx = p.shift();
                            var dy = p.shift();
                            cpx += dx;
                            cpy += dy;
                            if (startPoint == null) {
                                startPoint = [cpx, cpy];
                            }
                            cmd = 'M';
                            points.push(cpx, cpy);
                            c = 'l';
                            break;
                        case 'M':
                            cpx = p.shift();
                            cpy = p.shift();
                            cmd = 'M';
                            if (startPoint == null) {
                                startPoint = [cpx, cpy];
                            }
                            points.push(cpx, cpy);
                            c = 'L';
                            break;
                        case 'h':
                            cpx += p.shift();
                            cmd = 'L';
                            points.push(cpx, cpy);
                            break;
                        case 'H':
                            cpx = p.shift();
                            cmd = 'L';
                            points.push(cpx, cpy);
                            break;
                        case 'v':
                            cpy += p.shift();
                            cmd = 'L';
                            points.push(cpx, cpy);
                            break;
                        case 'V':
                            cpy = p.shift();
                            cmd = 'L';
                            points.push(cpx, cpy);
                            break;
                        case 'C':
                            points.push(p.shift(), p.shift(), p.shift(), p.shift());
                            cpx = p.shift();
                            cpy = p.shift();
                            points.push(cpx, cpy);
                            break;
                        case 'c':
                            points.push(cpx + p.shift(), cpy + p.shift(), cpx + p.shift(), cpy + p.shift());
                            cpx += p.shift();
                            cpy += p.shift();
                            cmd = 'C';
                            points.push(cpx, cpy);
                            break;
                        case 'S':
                            ctlPtx = cpx;
                            ctlPty = cpy;
                            prevCmd = ca[ca.length - 1];
                            if (prevCmd.command === 'C') {
                                ctlPtx = cpx + (cpx - prevCmd.points[2]);
                                ctlPty = cpy + (cpy - prevCmd.points[3]);
                            }
                            points.push(ctlPtx, ctlPty, p.shift(), p.shift());
                            cpx = p.shift();
                            cpy = p.shift();
                            cmd = 'C';
                            points.push(cpx, cpy);
                            break;
                        case 's':
                            ctlPtx = cpx;
                            ctlPty = cpy;
                            prevCmd = ca[ca.length - 1];
                            if (prevCmd.command === 'C') {
                                ctlPtx = cpx + (cpx - prevCmd.points[2]);
                                ctlPty = cpy + (cpy - prevCmd.points[3]);
                            }
                            points.push(ctlPtx, ctlPty, cpx + p.shift(), cpy + p.shift());
                            cpx += p.shift();
                            cpy += p.shift();
                            cmd = 'C';
                            points.push(cpx, cpy);
                            break;
                        case 'Q':
                            points.push(p.shift(), p.shift());
                            cpx = p.shift();
                            cpy = p.shift();
                            points.push(cpx, cpy);
                            break;
                        case 'q':
                            points.push(cpx + p.shift(), cpy + p.shift());
                            cpx += p.shift();
                            cpy += p.shift();
                            cmd = 'Q';
                            points.push(cpx, cpy);
                            break;
                        case 'T':
                            ctlPtx = cpx;
                            ctlPty = cpy;
                            prevCmd = ca[ca.length - 1];
                            if (prevCmd.command === 'Q') {
                                ctlPtx = cpx + (cpx - prevCmd.points[0]);
                                ctlPty = cpy + (cpy - prevCmd.points[1]);
                            }
                            cpx = p.shift();
                            cpy = p.shift();
                            cmd = 'Q';
                            points.push(ctlPtx, ctlPty, cpx, cpy);
                            break;
                        case 't':
                            ctlPtx = cpx;
                            ctlPty = cpy;
                            prevCmd = ca[ca.length - 1];
                            if (prevCmd.command === 'Q') {
                                ctlPtx = cpx + (cpx - prevCmd.points[0]);
                                ctlPty = cpy + (cpy - prevCmd.points[1]);
                            }
                            cpx += p.shift();
                            cpy += p.shift();
                            cmd = 'Q';
                            points.push(ctlPtx, ctlPty, cpx, cpy);
                            break;
                        case 'A':
                            rx = p.shift();
                            ry = p.shift();
                            psi = p.shift();
                            fa = p.shift();
                            fs = p.shift();
                            x1 = cpx;
                            y1 = cpy;
                            cpx = p.shift();
                            cpy = p.shift();
                            cmd = 'A';
                            points = [[x1, y1], rx, ry, psi, fa, fs, [cpx, cpy]];
                            break;
                        case 'a':
                            rx = p.shift();
                            ry = p.shift();
                            psi = p.shift();
                            fa = p.shift();
                            fs = p.shift();
                            x1 = cpx;
                            y1 = cpy;
                            cpx += p.shift();
                            cpy += p.shift();
                            cmd = 'A';
                            points = [[x1, y1], rx, ry, psi, fa, fs, [cpx, cpy]];
                            break;
                        case 'z':
                            cmd = 'Z';
                            if (startPoint) {
                                cpx = startPoint[0];
                                cpy = startPoint[1];
                                startPoint = null;
                            }
                            else {
                                cpx = 0;
                                cpy = 0;
                            }
                            p.shift();
                            points = [cpx, cpy];
                            break;
                        case 'Z':
                            cmd = 'Z';
                            if (startPoint) {
                                cpx = startPoint[0];
                                cpy = startPoint[1];
                                startPoint = null;
                            }
                            else {
                                cpx = 0;
                                cpy = 0;
                            }
                            p.shift();
                            points = [cpx, cpy];
                            break;
                    }
                    ca.push({
                        command: cmd || c,
                        points: points,
                        start: {
                            x: startX,
                            y: startY
                        }
                    });
                }
            }
            return ca;
        };
        return Graphics;
    })();
    txt.Graphics = Graphics;
})(txt || (txt = {}));
var createjs;
(function (createjs) {
    var Graphics;
    (function (Graphics) {
        var SVGArc = (function () {
            function SVGArc(x1, rx, ry, phi, fA, fS, x2) {
                this.rx = rx;
                this.ry = ry;
                this.x2 = x2;
                if (rx == 0 || ry == 0) {
                    return;
                }
                var phi = phi * (Math.PI / 180.0);
                rx = Math.abs(rx);
                ry = Math.abs(ry);
                var xPrime = this.rotClockwise(this.midPoint(x1, x2), phi);
                var xPrime2 = this.pointMul(xPrime, xPrime);
                var rx2 = Math.pow(rx, 2);
                var ry2 = Math.pow(ry, 2);
                var lambda = Math.sqrt(xPrime2[0] / rx2 + xPrime2[1] / ry2);
                if (lambda > 1) {
                    rx *= lambda;
                    ry *= lambda;
                    rx2 = Math.pow(rx, 2);
                    ry2 = Math.pow(ry, 2);
                }
                var t = (rx2 * ry2 - rx2 * xPrime2[1] - ry2 * xPrime2[0]);
                if (t > -.000001 && t < .000001) {
                    t = 0;
                }
                var b = (rx2 * xPrime2[1] + ry2 * xPrime2[0]);
                if (b > -.000001 && b < .000001) {
                    b = 0;
                }
                var factor = Math.sqrt(t / b);
                if (fA == fS) {
                    factor *= -1.0;
                }
                var cPrime = this.scale(factor, [rx * xPrime[1] / ry, -ry * xPrime[0] / rx]);
                var c = this.sum(this.rotCounterClockwise(cPrime, phi), this.meanVec(x1, x2));
                var x1UnitVector = [(xPrime[0] - cPrime[0]) / rx, (xPrime[1] - cPrime[1]) / ry];
                var x2UnitVector = [(-1.0 * xPrime[0] - cPrime[0]) / rx, (-1.0 * xPrime[1] - cPrime[1]) / ry];
                var theta = this.angle([1, 0], x1UnitVector);
                var deltaTheta = this.angle(x1UnitVector, x2UnitVector);
                if (isNaN(deltaTheta)) {
                    deltaTheta = Math.PI;
                }
                var start = theta;
                var end = theta + deltaTheta;
                this.cx = c[0];
                this.cy = c[1];
                this.phi = phi;
                this.rx = rx;
                this.ry = ry;
                this.start = start;
                this.end = end;
                this.fS = !fS;
            }
            SVGArc.prototype.mag = function (v) {
                return Math.sqrt(Math.pow(v[0], 2) + Math.pow(v[1], 2));
            };
            SVGArc.prototype.meanVec = function (u, v) {
                return [(u[0] + v[0]) / 2.0, (u[1] + v[1]) / 2.0];
            };
            SVGArc.prototype.dot = function (u, v) {
                return (u[0] * v[0] + u[1] * v[1]);
            };
            SVGArc.prototype.ratio = function (u, v) {
                return this.dot(u, v) / (this.mag(u) * this.mag(v));
            };
            SVGArc.prototype.rotClockwise = function (v, angle) {
                var cost = Math.cos(angle);
                var sint = Math.sin(angle);
                return [cost * v[0] + sint * v[1], -1 * sint * v[0] + cost * v[1]];
            };
            SVGArc.prototype.pointMul = function (u, v) {
                return [u[0] * v[0], u[1] * v[1]];
            };
            SVGArc.prototype.scale = function (c, v) {
                return [c * v[0], c * v[1]];
            };
            SVGArc.prototype.sum = function (u, v) {
                return [u[0] + v[0], u[1] + v[1]];
            };
            SVGArc.prototype.angle = function (u, v) {
                var sign = 1.0;
                if ((u[0] * v[1] - u[1] * v[0]) < 0) {
                    sign = -1.0;
                }
                return sign * Math.acos(this.ratio(u, v));
            };
            SVGArc.prototype.rotCounterClockwise = function (v, angle) {
                var cost = Math.cos(angle);
                var sint = Math.sin(angle);
                return [cost * v[0] - sint * v[1], sint * v[0] + cost * v[1]];
            };
            SVGArc.prototype.midPoint = function (u, v) {
                return [(u[0] - v[0]) / 2.0, (u[1] - v[1]) / 2.0];
            };
            SVGArc.prototype.exec = function (ctx) {
                if (this.rx == 0 || this.ry == 0) {
                    ctx.lineTo(this.x2[0], this.x2[1]);
                    return;
                }
                ctx.translate(this.cx, this.cy);
                ctx.rotate(this.phi);
                ctx.scale(this.rx, this.ry);
                ctx.arc(0, 0, 1, this.start, this.end, this.fS);
                ctx.scale(1 / this.rx, 1 / this.ry);
                ctx.rotate(-this.phi);
                ctx.translate(-this.cx, -this.cy);
            };
            return SVGArc;
        })();
        Graphics.SVGArc = SVGArc;
    })(Graphics = createjs.Graphics || (createjs.Graphics = {}));
})(createjs || (createjs = {}));
var txt;
(function (txt) {
    var Case = (function () {
        function Case() {
        }
        Case.NORMAL = 0;
        Case.UPPER = 1;
        Case.LOWER = 2;
        Case.SMALL_CAPS = 3;
        return Case;
    })();
    txt.Case = Case;
})(txt || (txt = {}));
var txt;
(function (txt) {
    var Align = (function () {
        function Align() {
        }
        Align.TOP_LEFT = 0;
        Align.TOP_CENTER = 1;
        Align.TOP_RIGHT = 2;
        Align.MIDDLE_LEFT = 3;
        Align.MIDDLE_CENTER = 4;
        Align.MIDDLE_RIGHT = 5;
        Align.BOTTOM_LEFT = 6;
        Align.BOTTOM_CENTER = 7;
        Align.BOTTOM_RIGHT = 8;
        Align.TL = 0;
        Align.TC = 1;
        Align.TR = 2;
        Align.ML = 3;
        Align.MC = 4;
        Align.MR = 5;
        Align.BL = 6;
        Align.BC = 7;
        Align.BR = 8;
        return Align;
    })();
    txt.Align = Align;
})(txt || (txt = {}));
var txt;
(function (txt) {
    var CharacterText = (function (_super) {
        __extends(CharacterText, _super);
        function CharacterText(props) {
            if (props === void 0) { props = null; }
            _super.call(this);
            this.text = "";
            this.lineHeight = null;
            this.width = 100;
            this.height = 20;
            this.align = txt.Align.TOP_LEFT;
            this.characterCase = txt.Case.NORMAL;
            this.size = 12;
            this.minSize = 6;
            this.font = "belinda";
            this.spacing = 0;
            this.ligatures = false;
            this.fillColor = "#000";
            this.strokeColor = null;
            this.strokeWidth = null;
            this.autoSize = false;
            this.loaderId = null;
            this.style = null;
            this.debug = false;
            this.lines = [];
            if (props) {
                this.set(props);
            }
            if (this.style == null) {
                txt.FontLoader.load(this, [this.font]);
            }
            else {
                var fonts = [this.font];
                var styleLength = this.style.length;
                for (var i = 0; i < styleLength; ++i) {
                    if (this.style[i] != undefined) {
                        if (this.style[i].font != undefined) {
                            fonts.push(this.style[i].font);
                        }
                    }
                }
                txt.FontLoader.load(this, fonts);
            }
        }
        CharacterText.prototype.complete = function () {
        };
        CharacterText.prototype.fontLoaded = function () {
            this.layout();
        };
        CharacterText.prototype.render = function () {
            this.getStage().update();
        };
        CharacterText.prototype.layout = function () {
            this.text = this.text.replace(/([\n][ \t]+)/g, '\n');
            this.lines = [];
            this.removeAllChildren();
            if (this.text === "" || this.text === undefined) {
                this.render();
                this.complete();
                return;
            }
            this.block = new createjs.Container();
            this.addChild(this.block);
            var font = txt.FontLoader.getFont(this.font);
            if (this.debug == true) {
                var s = new createjs.Shape();
                s.graphics.beginStroke("#FF0000");
                s.graphics.setStrokeStyle(1.2);
                s.graphics.drawRect(0, 0, this.width, this.height);
                this.addChild(s);
                s = new createjs.Shape();
                s.graphics.beginFill("#000");
                s.graphics.drawRect(0, 0, this.width, 0.2);
                s.x = 0;
                s.y = 0;
                this.block.addChild(s);
                s = new createjs.Shape();
                s.graphics.beginFill("#F00");
                s.graphics.drawRect(0, 0, this.width, 0.2);
                s.x = 0;
                s.y = -font['cap-height'] / font.units * this.size;
                this.block.addChild(s);
                s = new createjs.Shape();
                s.graphics.beginFill("#0F0");
                s.graphics.drawRect(0, 0, this.width, 0.2);
                s.x = 0;
                s.y = -font.ascent / font.units * this.size;
                this.block.addChild(s);
                s = new createjs.Shape();
                s.graphics.beginFill("#00F");
                s.graphics.drawRect(0, 0, this.width, 0.2);
                s.x = 0;
                s.y = -font.descent / font.units * this.size;
                this.block.addChild(s);
            }
            if (this.autoSize == true) {
                this.autoSizeMeasure();
            }
            if (this.characterLayout() === false) {
                this.removeAllChildren();
                return;
            }
            this.lineLayout();
            this.render();
            this.complete();
        };
        CharacterText.prototype.autoSizeMeasure = function (count) {
            if (count === void 0) { count = 0; }
            var size = this.size;
            var len = this.text.length;
            var width = this.width;
            var font = txt.FontLoader.fonts[this.font];
            var spacing = 0;
            if (this.spacing > 0) {
                spacing = this.spacing / font.units * len;
            }
            if (width < len * size * font.default / font.units + spacing) {
                if (count == 0) {
                    this.size = Math.ceil(((width - spacing) / len * font.units / font.default) * 1.2);
                    this.spacing = Math.floor(this.spacing * this.size / size);
                }
                else {
                    this.size--;
                    this.spacing = Math.floor(this.spacing * this.size / size);
                }
                if (this.size < this.minSize) {
                    this.size = this.minSize;
                    return;
                }
                this.autoSizeMeasure(count + 1);
                if (count == 0) {
                    this.size--;
                    this.spacing = Math.floor(this.spacing * this.size / size);
                    if (this.size < this.minSize) {
                        this.size = this.minSize;
                    }
                }
            }
        };
        CharacterText.prototype.characterLayout = function () {
            var len = this.text.length;
            var char;
            var defaultStyle = {
                size: this.size,
                font: this.font,
                spacing: this.spacing,
                characterCase: this.characterCase,
                fillColor: this.fillColor,
                strokeColor: this.strokeColor,
                strokeWidth: this.strokeWidth
            };
            var currentStyle = defaultStyle;
            var hPosition = 0;
            var vPosition = 0;
            var charKern;
            var spacing;
            var lineY = 0;
            var firstLine = true;
            var currentLine = new txt.Line();
            this.lines.push(currentLine);
            this.block.addChild(currentLine);
            for (var i = 0; i < len; i++) {
                if (this.style !== null && this.style[i] !== undefined) {
                    currentStyle = this.style[i];
                    if (currentStyle.size === undefined)
                        currentStyle.size = defaultStyle.size;
                    if (currentStyle.font === undefined)
                        currentStyle.font = defaultStyle.font;
                    if (currentStyle.spacing === undefined)
                        currentStyle.spacing = defaultStyle.spacing;
                    if (currentStyle.characterCase === undefined)
                        currentStyle.characterCase = defaultStyle.characterCase;
                    if (currentStyle.fillColor === undefined)
                        currentStyle.fillColor = defaultStyle.fillColor;
                    if (currentStyle.strokeColor === undefined)
                        currentStyle.strokeColor = defaultStyle.strokeColor;
                    if (currentStyle.strokeWidth === undefined)
                        currentStyle.strokeWidth = defaultStyle.strokeWidth;
                }
                if (this.text.charAt(i) == "\n" || this.text.charAt(i) == "\r") {
                    if (i < len - 1) {
                        if (firstLine === true) {
                            vPosition = currentStyle.size;
                            currentLine.measuredHeight = currentStyle.size;
                            currentLine.measuredWidth = hPosition;
                            lineY = 0;
                            currentLine.y = 0;
                        }
                        else if (this.lineHeight != undefined) {
                            vPosition = this.lineHeight;
                            currentLine.measuredHeight = vPosition;
                            currentLine.measuredWidth = hPosition;
                            lineY = lineY + vPosition;
                            currentLine.y = lineY;
                        }
                        else {
                            vPosition = char.measuredHeight;
                            currentLine.measuredHeight = vPosition;
                            currentLine.measuredWidth = hPosition;
                            lineY = lineY + vPosition;
                            currentLine.y = lineY;
                        }
                        firstLine = false;
                        currentLine = new txt.Line();
                        currentLine.measuredHeight = currentStyle.size;
                        currentLine.measuredWidth = 0;
                        this.lines.push(currentLine);
                        this.block.addChild(currentLine);
                        vPosition = 0;
                        hPosition = 0;
                    }
                    if (this.text.charAt(i) == "\r" && this.text.charAt(i + 1) == "\n") {
                        i++;
                    }
                    continue;
                }
                if (txt.FontLoader.isLoaded(currentStyle.font) === false) {
                    txt.FontLoader.load(this, [currentStyle.font]);
                    return false;
                }
                char = new txt.Character(this.text.charAt(i), currentStyle, i);
                if (firstLine === true) {
                    if (vPosition < char.size) {
                        vPosition = char.size;
                    }
                }
                else if (this.lineHeight != undefined && this.lineHeight > 0) {
                    if (vPosition < this.lineHeight) {
                        vPosition = this.lineHeight;
                    }
                }
                else if (char.measuredHeight > vPosition) {
                    vPosition = char.measuredHeight;
                }
                if (currentStyle.spacing == 0 && this.ligatures == true) {
                    var ligTarget = this.text.substr(i, 4);
                    if (char._font.ligatures[ligTarget.charAt(0)]) {
                        if (char._font.ligatures[ligTarget.charAt(0)][ligTarget.charAt(1)]) {
                            if (char._font.ligatures[ligTarget.charAt(0)][ligTarget.charAt(1)][ligTarget.charAt(2)]) {
                                if (char._font.ligatures[ligTarget.charAt(0)][ligTarget.charAt(1)][ligTarget.charAt(2)][ligTarget.charAt(3)]) {
                                    char.setGlyph(char._font.ligatures[ligTarget.charAt(0)][ligTarget.charAt(1)][ligTarget.charAt(2)][ligTarget.charAt(3)].glyph);
                                    i = i + 3;
                                }
                                else {
                                    char.setGlyph(char._font.ligatures[ligTarget.charAt(0)][ligTarget.charAt(1)][ligTarget.charAt(2)].glyph);
                                    i = i + 2;
                                }
                            }
                            else {
                                char.setGlyph(char._font.ligatures[ligTarget.charAt(0)][ligTarget.charAt(1)].glyph);
                                i = i + 1;
                            }
                        }
                    }
                }
                if (hPosition + char.measuredWidth > this.width) {
                    var lastchar = currentLine.children[currentLine.children.length - 1];
                    if (lastchar.characterCode == 32) {
                        currentLine.measuredWidth = hPosition - lastchar.measuredWidth - lastchar.spacingOffset() - lastchar._glyph.getKerning(this.getCharCodeAt(i), lastchar.size);
                    }
                    else {
                        currentLine.measuredWidth = hPosition - lastchar.spacingOffset() - lastchar._glyph.getKerning(this.getCharCodeAt(i), lastchar.size);
                    }
                    if (firstLine === true) {
                        currentLine.measuredHeight = vPosition;
                        currentLine.y = 0;
                        lineY = 0;
                    }
                    else {
                        currentLine.measuredHeight = vPosition;
                        lineY = lineY + vPosition;
                        currentLine.y = lineY;
                    }
                    firstLine = false;
                    currentLine = new txt.Line();
                    currentLine.addChild(char);
                    if (char.characterCode == 32) {
                        hPosition = 0;
                    }
                    else {
                        hPosition = char.x + (char._glyph.offset * char.size) + char.characterCaseOffset + char.spacingOffset();
                    }
                    this.lines.push(currentLine);
                    this.block.addChild(currentLine);
                    vPosition = 0;
                }
                else {
                    char.x = hPosition;
                    currentLine.addChild(char);
                    hPosition = char.x + (char._glyph.offset * char.size) + char.characterCaseOffset + char.spacingOffset() + char._glyph.getKerning(this.getCharCodeAt(i + 1), char.size);
                }
            }
            if (currentLine.children.length == 0) {
                var lw = this.lines.pop();
                currentLine = this.lines[this.lines.length - 1];
                hPosition = currentLine.measuredWidth;
                vPosition = currentLine.measuredHeight;
            }
            if (firstLine === true) {
                currentLine.measuredWidth = hPosition;
                currentLine.measuredHeight = vPosition;
                currentLine.y = 0;
            }
            else {
                currentLine.measuredWidth = hPosition;
                currentLine.measuredHeight = vPosition;
                if (vPosition == 0) {
                    if (this.lineHeight) {
                        vPosition = this.lineHeight;
                    }
                    else {
                        vPosition = currentStyle.size;
                    }
                }
                currentLine.y = lineY + vPosition;
            }
            return true;
        };
        CharacterText.prototype.getCharCodeAt = function (index) {
            if (this.characterCase == txt.Case.NORMAL) {
                return this.text.charAt(index).charCodeAt(0);
            }
            else if (this.characterCase == txt.Case.UPPER) {
                return this.text.charAt(index).toUpperCase().charCodeAt(0);
            }
            else if (this.characterCase == txt.Case.LOWER) {
                return this.text.charAt(index).toLowerCase().charCodeAt(0);
            }
            else if (this.characterCase == txt.Case.SMALL_CAPS) {
                return this.text.charAt(index).toUpperCase().charCodeAt(0);
            }
            else {
                return this.text.charAt(index).charCodeAt(0);
            }
        };
        CharacterText.prototype.lineLayout = function () {
            var blockHeight = 0;
            var measuredWidth = 0;
            var measuredHeight = 0;
            var line;
            var a = txt.Align;
            var fnt = txt.FontLoader.getFont(this.font);
            var aHeight = this.size * fnt.ascent / fnt.units;
            var cHeight = this.size * fnt['cap-height'] / fnt.units;
            var xHeight = this.size * fnt['x-height'] / fnt.units;
            var dHeight = this.size * fnt.descent / fnt.units;
            var lastCharOffset = 0;
            var len = this.lines.length;
            for (var i = 0; i < len; i++) {
                line = this.lines[i];
                measuredHeight += line.measuredHeight;
                if (line.lastCharacter()) {
                    lastCharOffset = line.lastCharacter().spacingOffset();
                }
                else {
                    lastCharOffset = 0;
                }
                if (this.align === a.TOP_CENTER) {
                    line.x = (this.width - line.measuredWidth + lastCharOffset) / 2;
                }
                else if (this.align === a.TOP_RIGHT) {
                    line.x = (this.width - line.measuredWidth);
                }
                else if (this.align === a.MIDDLE_CENTER) {
                    line.x = (this.width - line.measuredWidth + lastCharOffset) / 2;
                }
                else if (this.align === a.MIDDLE_RIGHT) {
                    line.x = (this.width - line.measuredWidth);
                }
                else if (this.align === a.BOTTOM_CENTER) {
                    line.x = (this.width - line.measuredWidth + lastCharOffset) / 2;
                }
                else if (this.align === a.BOTTOM_RIGHT) {
                    line.x = (this.width - line.measuredWidth);
                }
            }
            if (this.align === a.TOP_LEFT || this.align === a.TOP_CENTER || this.align === a.TOP_RIGHT) {
                if (fnt.top == 0) {
                    this.block.y = this.lines[0].measuredHeight * fnt.ascent / fnt.units;
                }
                else {
                    this.block.y = this.lines[0].measuredHeight * fnt.ascent / fnt.units + this.lines[0].measuredHeight * fnt.top / fnt.units;
                }
            }
            else if (this.align === a.MIDDLE_LEFT || this.align === a.MIDDLE_CENTER || this.align === a.MIDDLE_RIGHT) {
                this.block.y = this.lines[0].measuredHeight + (this.height - measuredHeight) / 2 + this.lines[0].measuredHeight * fnt.middle / fnt.units;
            }
            else if (this.align === a.BOTTOM_LEFT || this.align === a.BOTTOM_CENTER || this.align === a.BOTTOM_RIGHT) {
                this.block.y = this.height - this.lines[this.lines.length - 1].y + this.lines[0].measuredHeight * fnt.bottom / fnt.units;
            }
        };
        return CharacterText;
    })(createjs.Container);
    txt.CharacterText = CharacterText;
})(txt || (txt = {}));
var txt;
(function (txt) {
    var PathText = (function (_super) {
        __extends(PathText, _super);
        function PathText(props) {
            if (props === void 0) { props = null; }
            _super.call(this);
            this.text = "";
            this.characterCase = txt.Case.NORMAL;
            this.size = 12;
            this.font = "belinda";
            this.spacing = 0;
            this.ligatures = false;
            this.fillColor = "#000";
            this.strokeColor = null;
            this.strokeWidth = null;
            this.style = null;
            this.debug = false;
            this.path = "";
            this.start = 0;
            this.center = null;
            this.end = null;
            this.flipped = false;
            if (props) {
                this.set(props);
            }
            if (this.style == null) {
                txt.FontLoader.load(this, [this.font]);
            }
            else {
                var fonts = [this.font];
                var styleLength = this.style.length;
                for (var i = 0; i < styleLength; ++i) {
                    if (this.style[i] != undefined) {
                        if (this.style[i].font != undefined) {
                            fonts.push(this.style[i].font);
                        }
                    }
                }
                txt.FontLoader.load(this, fonts);
            }
            this.points = this.pathToPoints();
        }
        PathText.prototype.fontLoaded = function () {
            this.layout();
        };
        PathText.prototype.render = function () {
            this.getStage().update();
        };
        PathText.prototype.layout = function () {
            this.removeAllChildren();
            this.characters = [];
            if (this.debug == true) {
                var s = new createjs.Shape();
                s.graphics.beginStroke("#FF0000");
                s.graphics.setStrokeStyle(0.1);
                s.graphics.decodeSVGPath(this.path);
                this.addChild(s);
            }
            if (this.text === "" || this.text === undefined) {
                this.render();
                return;
            }
            this.block = new createjs.Container();
            this.addChild(this.block);
            if (this.characterLayout() === false) {
                this.removeAllChildren();
                return;
            }
            this.render();
        };
        PathText.prototype.characterLayout = function () {
            var len = this.text.length;
            var char;
            var defaultStyle = {
                size: this.size,
                font: this.font,
                spacing: this.spacing,
                characterCase: this.characterCase,
                fillColor: this.fillColor,
                strokeColor: this.strokeColor,
                strokeWidth: this.strokeWidth
            };
            var currentStyle = defaultStyle;
            var hPosition = 0;
            var charKern;
            var spacing;
            var point;
            var p0Distance;
            var p0;
            var p1;
            var p2;
            var angle;
            var pathDistance = txt.PathText.DISTANCE;
            var pointLength = this.points.length;
            for (var i = 0; i < len; i++) {
                if (this.style !== null && this.style[i] !== undefined) {
                    currentStyle = this.style[i];
                    if (currentStyle.size === undefined)
                        currentStyle.size = defaultStyle.size;
                    if (currentStyle.font === undefined)
                        currentStyle.font = defaultStyle.font;
                    if (currentStyle.spacing === undefined)
                        currentStyle.spacing = defaultStyle.spacing;
                    if (currentStyle.characterCase === undefined)
                        currentStyle.characterCase = defaultStyle.characterCase;
                    if (currentStyle.fillColor === undefined)
                        currentStyle.fillColor = defaultStyle.fillColor;
                    if (currentStyle.strokeColor === undefined)
                        currentStyle.strokeColor = defaultStyle.strokeColor;
                    if (currentStyle.strokeWidth === undefined)
                        currentStyle.strokeWidth = defaultStyle.strokeWidth;
                }
                if (this.text.charAt(i) == "\n") {
                    continue;
                }
                if (txt.FontLoader.isLoaded(currentStyle.font) === false) {
                    txt.FontLoader.load(this, [currentStyle.font]);
                    return false;
                }
                char = new txt.Character(this.text.charAt(i), currentStyle, i);
                if (currentStyle.spacing == 0 && this.ligatures == true) {
                    var ligTarget = this.text.substr(i, 4);
                    if (char._font.ligatures[ligTarget.charAt(0)]) {
                        if (char._font.ligatures[ligTarget.charAt(0)][ligTarget.charAt(1)]) {
                            if (char._font.ligatures[ligTarget.charAt(0)][ligTarget.charAt(1)][ligTarget.charAt(2)]) {
                                if (char._font.ligatures[ligTarget.charAt(0)][ligTarget.charAt(1)][ligTarget.charAt(2)][ligTarget.charAt(3)]) {
                                    char.setGlyph(char._font.ligatures[ligTarget.charAt(0)][ligTarget.charAt(1)][ligTarget.charAt(2)][ligTarget.charAt(3)].glyph);
                                    i = i + 3;
                                }
                                else {
                                    char.setGlyph(char._font.ligatures[ligTarget.charAt(0)][ligTarget.charAt(1)][ligTarget.charAt(2)].glyph);
                                    i = i + 2;
                                }
                            }
                            else {
                                char.setGlyph(char._font.ligatures[ligTarget.charAt(0)][ligTarget.charAt(1)].glyph);
                                i = i + 1;
                            }
                        }
                    }
                }
                char.hPosition = hPosition;
                this.characters.push(char);
                this.block.addChild(char);
                hPosition = hPosition + (char._glyph.offset * char.size) + char.characterCaseOffset + char.spacingOffset() + char._glyph.getKerning(this.getCharCodeAt(i + 1), char.size);
            }
            var offsetStart = Math.round((pointLength * pathDistance - hPosition) / 2);
            len = this.characters.length;
            for (i = 0; i < len; i++) {
                char = this.characters[i];
                p0Distance = Math.round((offsetStart + char.hPosition) / pathDistance);
                p0 = this.points[p0Distance];
                if (p0 == undefined) {
                    break;
                }
                char.x = p0.x;
                char.y = p0.y;
                p0 = this.points[p0Distance + 15];
                if (i + 35 < pointLength) {
                    p1 = this.points[p0Distance + 35];
                    angle = Math.atan((p0.y - p1.y) / (p0.x - p1.x)) * 180 / Math.PI;
                    if (p0.x >= p1.x) {
                        angle = angle + 180;
                    }
                }
                else {
                    p1 = this.points[p0Distance - 35];
                    angle = Math.atan((p1.y - p0.y) / (p1.x - p0.x)) * 180 / Math.PI;
                    if (p1.x >= p0.x) {
                        angle = angle + 180;
                    }
                }
                char.rotation = angle;
            }
            return true;
        };
        PathText.prototype.getCharCodeAt = function (index) {
            if (this.characterCase == txt.Case.NORMAL) {
                return this.text.charAt(index).charCodeAt(0);
            }
            else if (this.characterCase == txt.Case.UPPER) {
                return this.text.charAt(index).toUpperCase().charCodeAt(0);
            }
            else if (this.characterCase == txt.Case.LOWER) {
                return this.text.charAt(index).toLowerCase().charCodeAt(0);
            }
            else if (this.characterCase == txt.Case.SMALL_CAPS) {
                return this.text.charAt(index).toUpperCase().charCodeAt(0);
            }
            else {
                return this.text.charAt(index).charCodeAt(0);
            }
        };
        PathText.prototype.pathToPoints = function () {
            var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttributeNS(null, "d", this.path);
            var pathLength = path.getTotalLength();
            var pathClosed = (this.path.toLowerCase().indexOf('z') != -1);
            if (this.end == null) {
                this.end = pathLength;
            }
            if (this.center == null) {
                this.center = (this.end - this.start) / 2;
            }
            var i;
            var point;
            var result = [];
            var lastAngle = null;
            var angle = null;
            var last;
            var pathDistance = txt.PathText.DISTANCE;
            if (pathClosed) {
                if (this.flipped) {
                    i = this.start;
                    result = [];
                    while (i >= this.end) {
                        if (i > pathLength) {
                            i = 0;
                            break;
                        }
                        result.push(path.getPointAtLength(i));
                        i = i + pathDistance;
                    }
                    while (i < this.end) {
                        result.push(path.getPointAtLength(i));
                        i = i + pathDistance;
                    }
                    return result;
                }
                else {
                    i = this.end;
                    result = [];
                    while (i >= this.start) {
                        if (i > pathLength) {
                            i = 0;
                            break;
                        }
                        result.push(path.getPointAtLength(i));
                        i = i + pathDistance;
                    }
                    while (i < this.start) {
                        result.push(path.getPointAtLength(i));
                        i = i + pathDistance;
                    }
                    result.reverse();
                    return result;
                }
            }
            else {
                if (this.flipped) {
                    i = this.start;
                    result = [];
                    while (i >= this.end) {
                        if (i > pathLength) {
                            i = 0;
                            break;
                        }
                        result.push(path.getPointAtLength(i));
                        i = i + pathDistance;
                    }
                    while (i < this.end) {
                        result.push(path.getPointAtLength(i));
                        i = i + pathDistance;
                    }
                    return result;
                }
                else {
                    i = this.start;
                    result = [];
                    while (i <= this.end) {
                        result.push(path.getPointAtLength(i));
                        i = i + pathDistance;
                    }
                    return result;
                }
            }
        };
        PathText.DISTANCE = 0.1;
        return PathText;
    })(createjs.Container);
    txt.PathText = PathText;
})(txt || (txt = {}));
var txt;
(function (txt) {
    var Word = (function (_super) {
        __extends(Word, _super);
        function Word() {
            _super.call(this);
            this.hasNewLine = false;
            this.hasHyphen = false;
            this.hasSpace = false;
            this.spaceOffset = 0;
        }
        Word.prototype.lastCharacter = function () {
            return this.children[this.children.length - 1];
        };
        return Word;
    })(createjs.Container);
    txt.Word = Word;
})(txt || (txt = {}));
var txt;
(function (txt) {
    var Line = (function (_super) {
        __extends(Line, _super);
        function Line() {
            _super.call(this);
        }
        Line.prototype.lastWord = function () {
            return this.children[this.children.length - 1];
        };
        Line.prototype.lastCharacter = function () {
            return this.children[this.children.length - 1];
        };
        return Line;
    })(createjs.Container);
    txt.Line = Line;
})(txt || (txt = {}));
