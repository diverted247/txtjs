var txt;
(function (txt) {
    var Accessibility = (function () {
        function Accessibility() {
        }
        Accessibility.set = function (element) {
            if (element.stage == null) {
                return;
            }
            if (txt.Accessibility.timeout != null) {
                clearTimeout(txt.Accessibility.timeout);
            }
            if (element.accessibilityId == null) {
                txt.Accessibility.data.push(element);
                element.accessibilityId = txt.Accessibility.data.length - 1;
            }
            txt.Accessibility.timeout = setTimeout(txt.Accessibility.update, 300);
        };
        Accessibility.update = function () {
            txt.Accessibility.timeout = null;
            var data = txt.Accessibility.data.slice(0);
            data.sort(function (a, b) { return a.accessibilityPriority - b.accessibilityPriority; });
            var len = data.length;
            var out = "";
            var currentCanvas = data[0].stage.canvas;
            for (var i = 0; i < len; i++) {
                if (data[i].stage == null) {
                    continue;
                }
                if (currentCanvas != data[i].stage.canvas) {
                    currentCanvas.innerHTML = out;
                    out = "";
                    currentCanvas = data[i].stage.canvas;
                }
                if (data[i].accessibilityText == null) {
                    out += '<p>' + data[i].text + '</p>';
                }
                else {
                    out += data[i].accessibilityText;
                }
            }
            currentCanvas.innerHTML = out;
        };
        Accessibility.clear = function () {
            txt.Accessibility.data = [];
        };
        Accessibility.data = [];
        Accessibility.timeout = null;
        return Accessibility;
    })();
    txt.Accessibility = Accessibility;
})(txt || (txt = {}));
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
            this.tracking = 0;
            this.ligatures = false;
            this.fillColor = "#000";
            this.strokeColor = null;
            this.strokeWidth = null;
            this.loaderId = null;
            this.style = null;
            this.debug = false;
            this.original = null;
            this.words = [];
            this.lines = [];
            this.missingGlyphs = null;
            this.renderCycle = true;
            this.accessibilityText = null;
            this.accessibilityPriority = 2;
            this.accessibilityId = null;
            if (props) {
                this.original = props;
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
        Text.prototype.complete = function () { };
        Text.prototype.fontLoaded = function (font) {
            this.layout();
        };
        Text.prototype.layout = function () {
            txt.Accessibility.set(this);
            this.text = this.text.replace(/([\n][ \t]+)/g, '\n');
            this.words = [];
            this.lines = [];
            this.missingGlyphs = null;
            this.removeAllChildren();
            this.block = new createjs.Container();
            this.addChild(this.block);
            if (this.debug == true) {
                var font = txt.FontLoader.getFont(this.font);
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
            if (this.text === "" || this.text === undefined) {
                this.render();
                this.complete();
                return;
            }
            if (this.characterLayout() === false) {
                this.removeAllChildren();
                return;
            }
            if (this.renderCycle === false) {
                this.removeAllChildren();
                this.complete();
                return;
            }
            this.wordLayout();
            this.lineLayout();
            this.render();
            this.complete();
        };
        Text.prototype.characterLayout = function () {
            //characterlayout adds Charcters to words and measures true height. LineHeight is not a factor til Line layout.
            var len = this.text.length;
            var char;
            var defaultStyle = {
                size: this.size,
                font: this.font,
                tracking: this.tracking,
                characterCase: this.characterCase,
                fillColor: this.fillColor,
                strokeColor: this.strokeColor,
                strokeWidth: this.strokeWidth
            };
            var currentStyle = defaultStyle;
            var hPosition = 0;
            var vPosition = 0;
            var charKern;
            var tracking;
            var currentWord = new txt.Word();
            this.words.push(currentWord);
            for (var i = 0; i < len; i++) {
                if (this.style !== null && this.style[i] !== undefined) {
                    currentStyle = this.style[i];
                    if (currentStyle.size === undefined)
                        currentStyle.size = defaultStyle.size;
                    if (currentStyle.font === undefined)
                        currentStyle.font = defaultStyle.font;
                    if (currentStyle.tracking === undefined)
                        currentStyle.tracking = defaultStyle.tracking;
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
                if (this.original.character) {
                    if (this.original.character.added) {
                        char.on('added', this.original.character.added);
                    }
                    if (this.original.character.click) {
                        char.on('click', this.original.character.click);
                    }
                    if (this.original.character.dblclick) {
                        char.on('dblclick', this.original.character.dblclick);
                    }
                    if (this.original.character.mousedown) {
                        char.on('mousedown', this.original.character.mousedown);
                    }
                    if (this.original.character.mouseout) {
                        char.on('mouseout', this.original.character.mouseout);
                    }
                    if (this.original.character.mouseover) {
                        char.on('mouseover', this.original.character.mouseover);
                    }
                    if (this.original.character.pressmove) {
                        char.on('pressmove', this.original.character.pressmove);
                    }
                    if (this.original.character.pressup) {
                        char.on('pressup', this.original.character.pressup);
                    }
                    if (this.original.character.removed) {
                        char.on('removed', this.original.character.removed);
                    }
                    if (this.original.character.rollout) {
                        char.on('rollout', this.original.character.rollout);
                    }
                    if (this.original.character.rollover) {
                        char.on('rollover', this.original.character.rollover);
                    }
                    if (this.original.character.tick) {
                        char.on('tick', this.original.character.tick);
                    }
                }
                if (char.missing) {
                    if (this.missingGlyphs == null) {
                        this.missingGlyphs = [];
                    }
                    this.missingGlyphs.push({ position: i, character: this.text.charAt(i), font: currentStyle.font });
                }
                if (char.measuredHeight > vPosition) {
                    vPosition = char.measuredHeight;
                }
                if (currentStyle.tracking == 0 && this.ligatures == true) {
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
                    hPosition = char.x + (char._glyph.offset * char.size) + char.characterCaseOffset + char.trackingOffset() + char._glyph.getKerning(this.text.charCodeAt(i + 1), char.size);
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
                hPosition = char.x + (char._glyph.offset * char.size) + char.characterCaseOffset + char.trackingOffset() + char._glyph.getKerning(this.text.charCodeAt(i + 1), char.size);
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
                if (this.original.word) {
                    if (this.original.word.added) {
                        currentWord.on('added', this.original.word.added);
                    }
                    if (this.original.word.click) {
                        currentWord.on('click', this.original.word.click);
                    }
                    if (this.original.word.dblclick) {
                        currentWord.on('dblclick', this.original.word.dblclick);
                    }
                    if (this.original.word.mousedown) {
                        currentWord.on('mousedown', this.original.word.mousedown);
                    }
                    if (this.original.word.mouseout) {
                        currentWord.on('mouseout', this.original.word.mouseout);
                    }
                    if (this.original.word.mouseover) {
                        currentWord.on('mouseover', this.original.word.mouseover);
                    }
                    if (this.original.word.pressmove) {
                        currentWord.on('pressmove', this.original.word.pressmove);
                    }
                    if (this.original.word.pressup) {
                        currentWord.on('pressup', this.original.word.pressup);
                    }
                    if (this.original.word.removed) {
                        currentWord.on('removed', this.original.word.removed);
                    }
                    if (this.original.word.rollout) {
                        currentWord.on('rollout', this.original.word.rollout);
                    }
                    if (this.original.word.rollover) {
                        currentWord.on('rollover', this.original.word.rollover);
                    }
                    if (this.original.word.tick) {
                        currentWord.on('tick', this.original.word.tick);
                    }
                }
                if (firstLine) {
                    vPosition = currentWord.measuredHeight;
                }
                else if (this.lineHeight != null) {
                    vPosition = this.lineHeight;
                }
                else if (currentWord.measuredHeight > vPosition) {
                    vPosition = currentWord.measuredHeight;
                }
                if (hPosition + currentWord.measuredWidth > this.width && currentWord.hasNewLine == true && currentLine.children.length > 0) {
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
                    if (firstLine == false && this.lineHeight != null) {
                        currentLine.measuredHeight = this.lineHeight;
                    }
                    else {
                        currentLine.measuredHeight = vPosition;
                    }
                    firstLine = false;
                    currentLine = new txt.Line();
                    this.lines.push(currentLine);
                    currentLine.y = lastHeight;
                    hPosition = 0;
                    currentWord.x = 0;
                    this.block.addChild(currentLine);
                    var swapWord = this.words[i];
                    currentLine.addChild(swapWord);
                    if (this.lineHeight != null) {
                        currentLine.measuredHeight = this.lineHeight;
                    }
                    else {
                        currentLine.measuredHeight = swapWord.measuredHeight;
                    }
                    currentLine.measuredWidth = swapWord.measuredWidth;
                    currentLine = new txt.Line();
                    this.lines.push(currentLine);
                    if (this.lineHeight != null) {
                        currentLine.y = lastHeight + this.lineHeight;
                    }
                    else {
                        currentLine.y = lastHeight + vPosition;
                    }
                    this.block.addChild(currentLine);
                    if (i < len - 1) {
                        vPosition = 0;
                    }
                    continue;
                }
                else if (hPosition + currentWord.measuredWidth > this.width && i > 0 && currentLine.children.length > 0) {
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
                    if (firstLine == false && this.lineHeight != null) {
                        currentLine.measuredHeight = this.lineHeight;
                    }
                    else {
                        currentLine.measuredHeight = vPosition;
                    }
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
                    if (firstLine == false && this.lineHeight != null) {
                        currentLine.measuredHeight = this.lineHeight;
                    }
                    else {
                        currentLine.measuredHeight = vPosition;
                    }
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
            var len = this.lines.length;
            for (var i = 0; i < len; i++) {
                line = this.lines[i];
                if (this.original.line) {
                    if (this.original.line.added) {
                        line.on('added', this.original.line.added);
                    }
                    if (this.original.line.click) {
                        line.on('click', this.original.line.click);
                    }
                    if (this.original.line.dblclick) {
                        line.on('dblclick', this.original.line.dblclick);
                    }
                    if (this.original.line.mousedown) {
                        line.on('mousedown', this.original.line.mousedown);
                    }
                    if (this.original.line.mouseout) {
                        line.on('mouseout', this.original.line.mouseout);
                    }
                    if (this.original.line.mouseover) {
                        line.on('mouseover', this.original.line.mouseover);
                    }
                    if (this.original.line.pressmove) {
                        line.on('pressmove', this.original.line.pressmove);
                    }
                    if (this.original.line.pressup) {
                        line.on('pressup', this.original.line.pressup);
                    }
                    if (this.original.line.removed) {
                        line.on('removed', this.original.line.removed);
                    }
                    if (this.original.line.rollout) {
                        line.on('rollout', this.original.line.rollout);
                    }
                    if (this.original.line.rollover) {
                        line.on('rollover', this.original.line.rollover);
                    }
                    if (this.original.line.tick) {
                        line.on('tick', this.original.line.tick);
                    }
                }
                if (line.lastWord() != undefined && line.lastWord().lastCharacter()) {
                    line.measuredWidth -= line.lastWord().lastCharacter().trackingOffset();
                }
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
            if (this.original.block) {
                if (this.original.block.added) {
                    this.block.on('added', this.original.block.added);
                }
                if (this.original.block.click) {
                    this.block.on('click', this.original.block.click);
                }
                if (this.original.block.dblclick) {
                    this.block.on('dblclick', this.original.block.dblclick);
                }
                if (this.original.block.mousedown) {
                    this.block.on('mousedown', this.original.block.mousedown);
                }
                if (this.original.block.mouseout) {
                    this.block.on('mouseout', this.original.block.mouseout);
                }
                if (this.original.block.mouseover) {
                    this.block.on('mouseover', this.original.block.mouseover);
                }
                if (this.original.block.pressmove) {
                    this.block.on('pressmove', this.original.block.pressmove);
                }
                if (this.original.block.pressup) {
                    this.block.on('pressup', this.original.block.pressup);
                }
                if (this.original.block.removed) {
                    this.block.on('removed', this.original.block.removed);
                }
                if (this.original.block.rollout) {
                    this.block.on('rollout', this.original.block.rollout);
                }
                if (this.original.block.rollover) {
                    this.block.on('rollover', this.original.block.rollover);
                }
                if (this.original.block.tick) {
                    this.block.on('tick', this.original.block.tick);
                }
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
            this.tracking = null;
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
            this.missing = false;
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
                console.log("MISSING GLYPH:" + this.character);
                this._glyph = this._font.glyphs[42];
                this.missing = true;
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
            ha.graphics.beginFill('#000').drawRect(0, this._font.descent, this._glyph.offset * this._font.units, this._font.ascent - this._font.descent);
            this.hitArea = ha;
        }
        Character.prototype.setGlyph = function (glyph) {
            this._glyph = glyph;
            this.graphics = this._glyph.graphic();
        };
        Character.prototype.trackingOffset = function () {
            return this.size * (2.5 / this._font.units + 1 / 900 + this.tracking / 990);
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
            window.setTimeout(function () { loader._target.fontLoaded(); }, 1);
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
                if (localStorage && txt.FontLoader.cache) {
                    var local = JSON.parse(localStorage.getItem('txt_font_' + fontName.split(' ').join('_')));
                    if (local != null) {
                        if (local.version === txt.FontLoader.version) {
                            req.cacheResponseText = local.font;
                            req.cacheFont = true;
                        }
                    }
                }
                req.onload = function () {
                    if (localStorage && txt.FontLoader.cache && this.cacheFont == undefined) {
                        localStorage.setItem('txt_font_' + fontName.split(' ').join('_'), JSON.stringify({ font: this.responseText, version: txt.FontLoader.version }));
                    }
                    var lines = this.responseText.split('\n');
                    if (this.cacheResponseText) {
                        lines = this.cacheResponseText.split('\n');
                    }
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
                if (req.cacheFont == true) {
                    req.onload();
                }
                else {
                    req.open("get", txt.FontLoader.path + fontName.split(" ").join('_') + '.txt', true);
                    req.send();
                }
            }
        };
        FontLoader.path = "/font/";
        FontLoader.cache = false;
        FontLoader.version = 0;
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
            this.minSize = null;
            this.maxTracking = null;
            this.font = "belinda";
            this.tracking = 0;
            this.ligatures = false;
            this.fillColor = "#000";
            this.strokeColor = null;
            this.strokeWidth = null;
            this.singleLine = false;
            this.autoExpand = false;
            this.autoReduce = false;
            this.overset = false;
            this.oversetIndex = null;
            this.loaderId = null;
            this.style = null;
            this.debug = false;
            this.original = null;
            this.lines = [];
            this.missingGlyphs = null;
            this.renderCycle = true;
            this.measured = false;
            this.oversetPotential = false;
            this.accessibilityText = null;
            this.accessibilityPriority = 2;
            this.accessibilityId = null;
            if (props) {
                this.original = props;
                this.set(props);
                this.original.tracking = this.tracking;
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
        CharacterText.prototype.complete = function () { };
        CharacterText.prototype.fontLoaded = function () {
            this.layout();
        };
        CharacterText.prototype.render = function () {
            this.getStage().update();
        };
        CharacterText.prototype.layout = function () {
            txt.Accessibility.set(this);
            this.overset = false;
            this.measured = false;
            this.oversetPotential = false;
            if (this.original.size) {
                this.size = this.original.size;
            }
            if (this.original.tracking) {
                this.tracking = this.original.tracking;
            }
            this.text = this.text.replace(/([\n][ \t]+)/g, '\n');
            if (this.singleLine === true) {
                this.text = this.text.split('\n').join('');
                this.text = this.text.split('\r').join('');
            }
            this.lines = [];
            this.missingGlyphs = null;
            this.removeAllChildren();
            if (this.text === "" || this.text === undefined) {
                this.render();
                this.complete();
                return;
            }
            this.block = new createjs.Container();
            this.addChild(this.block);
            if (this.debug == true) {
                var font = txt.FontLoader.getFont(this.font);
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
            if (this.singleLine === true && (this.autoExpand === true || this.autoReduce === true)) {
                this.measure();
            }
            if (this.renderCycle === false) {
                this.removeAllChildren();
                this.complete();
                return;
            }
            if (this.characterLayout() === false) {
                this.removeAllChildren();
                return;
            }
            this.lineLayout();
            this.render();
            this.complete();
        };
        CharacterText.prototype.measure = function () {
            this.measured = true;
            var size = this.original.size;
            var len = this.text.length;
            var width = this.getWidth();
            var defaultStyle = {
                size: this.original.size,
                font: this.original.font,
                tracking: this.original.tracking,
                characterCase: this.original.characterCase
            };
            var currentStyle;
            var charCode = null;
            var font;
            var charMetrics = [];
            var largestFontSize = defaultStyle.size;
            for (var i = 0; i < len; i++) {
                charCode = this.text.charCodeAt(i);
                currentStyle = defaultStyle;
                if (this.original.style !== undefined && this.original.style[i] !== undefined) {
                    currentStyle = this.original.style[i];
                    if (currentStyle.size === undefined)
                        currentStyle.size = defaultStyle.size;
                    if (currentStyle.font === undefined)
                        currentStyle.font = defaultStyle.font;
                    if (currentStyle.tracking === undefined)
                        currentStyle.tracking = defaultStyle.tracking;
                }
                if (currentStyle.size > largestFontSize) {
                    largestFontSize = currentStyle.size;
                }
                font = txt.FontLoader.fonts[currentStyle.font];
                charMetrics.push({
                    char: this.text[i],
                    size: currentStyle.size,
                    charCode: charCode,
                    font: currentStyle.font,
                    offset: font.glyphs[charCode].offset,
                    units: font.units,
                    tracking: this.trackingOffset(currentStyle.tracking, currentStyle.size, font.units),
                    kerning: font.glyphs[charCode].getKerning(this.getCharCodeAt(i + 1), 1)
                });
            }
            var space = {
                char: " ",
                size: currentStyle.size,
                charCode: 32,
                font: currentStyle.font,
                offset: font.glyphs[32].offset,
                units: font.units,
                tracking: 0,
                kerning: 0
            };
            charMetrics[charMetrics.length - 1].tracking = 0;
            len = charMetrics.length;
            var metricBaseWidth = 0;
            var metricRealWidth = 0;
            var metricRealWidthTracking = 0;
            var current = null;
            for (var i = 0; i < len; i++) {
                current = charMetrics[i];
                metricBaseWidth = metricBaseWidth + current.offset + current.kerning;
                metricRealWidth = metricRealWidth + ((current.offset + current.kerning) * current.size);
                metricRealWidthTracking = metricRealWidthTracking +
                    ((current.offset + current.kerning + current.tracking) * current.size);
            }
            if (metricRealWidth > this.width) {
                if (this.autoReduce === true) {
                    this.tracking = 0;
                    this.size = this.original.size * this.width / (metricRealWidth + (space.offset * space.size));
                    if (this.minSize != null && this.size < this.minSize) {
                        this.size = this.minSize;
                        this.oversetPotential = true;
                    }
                    return true;
                }
            }
            else {
                var trackMetric = this.offsetTracking((this.width - metricRealWidth) / (len), current.size, current.units);
                if (trackMetric < 0) {
                    trackMetric = 0;
                }
                if (trackMetric > this.original.tracking && this.autoExpand) {
                    if (this.maxTracking != null && trackMetric > this.maxTracking) {
                        this.tracking = this.maxTracking;
                    }
                    else {
                        this.tracking = trackMetric;
                    }
                    this.size = this.original.size;
                    return true;
                }
                if (trackMetric < this.original.tracking && this.autoReduce) {
                    if (this.maxTracking != null && trackMetric > this.maxTracking) {
                        this.tracking = this.maxTracking;
                    }
                    else {
                        this.tracking = trackMetric;
                    }
                    this.size = this.original.size;
                    return true;
                }
            }
            return true;
        };
        CharacterText.prototype.trackingOffset = function (tracking, size, units) {
            return size * (2.5 / units + 1 / 900 + tracking / 990);
        };
        CharacterText.prototype.offsetTracking = function (offset, size, units) {
            return Math.floor((offset - 2.5 / units - 1 / 900) * 990 / size);
        };
        CharacterText.prototype.getWidth = function () {
            return this.width;
        };
        CharacterText.prototype.characterLayout = function () {
            //characterlayout adds Charcters to lines. LineHeight IS a factor given lack of Words.
            var len = this.text.length;
            var char;
            var defaultStyle = {
                size: this.size,
                font: this.font,
                tracking: this.tracking,
                characterCase: this.characterCase,
                fillColor: this.fillColor,
                strokeColor: this.strokeColor,
                strokeWidth: this.strokeWidth
            };
            var currentStyle = defaultStyle;
            var hPosition = 0;
            var vPosition = 0;
            var charKern;
            var tracking;
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
                    if (currentStyle.tracking === undefined)
                        currentStyle.tracking = defaultStyle.tracking;
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
                if (this.original.character) {
                    if (this.original.character.added) {
                        char.on('added', this.original.character.added);
                    }
                    if (this.original.character.click) {
                        char.on('click', this.original.character.click);
                    }
                    if (this.original.character.dblclick) {
                        char.on('dblclick', this.original.character.dblclick);
                    }
                    if (this.original.character.mousedown) {
                        char.on('mousedown', this.original.character.mousedown);
                    }
                    if (this.original.character.mouseout) {
                        char.on('mouseout', this.original.character.mouseout);
                    }
                    if (this.original.character.mouseover) {
                        char.on('mouseover', this.original.character.mouseover);
                    }
                    if (this.original.character.pressmove) {
                        char.on('pressmove', this.original.character.pressmove);
                    }
                    if (this.original.character.pressup) {
                        char.on('pressup', this.original.character.pressup);
                    }
                    if (this.original.character.removed) {
                        char.on('removed', this.original.character.removed);
                    }
                    if (this.original.character.rollout) {
                        char.on('rollout', this.original.character.rollout);
                    }
                    if (this.original.character.rollover) {
                        char.on('rollover', this.original.character.rollover);
                    }
                    if (this.original.character.tick) {
                        char.on('tick', this.original.character.tick);
                    }
                }
                if (char.missing) {
                    if (this.missingGlyphs == null) {
                        this.missingGlyphs = [];
                    }
                    this.missingGlyphs.push({ position: i, character: this.text.charAt(i), font: currentStyle.font });
                }
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
                if (currentStyle.tracking == 0 && this.ligatures == true) {
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
                if (this.overset == true) {
                    break;
                }
                else if (this.singleLine === false && hPosition + char.measuredWidth > this.width) {
                    var lastchar = currentLine.children[currentLine.children.length - 1];
                    if (lastchar.characterCode == 32) {
                        currentLine.measuredWidth = hPosition - lastchar.measuredWidth - lastchar.trackingOffset() - lastchar._glyph.getKerning(this.getCharCodeAt(i), lastchar.size);
                    }
                    else {
                        currentLine.measuredWidth = hPosition - lastchar.trackingOffset() - lastchar._glyph.getKerning(this.getCharCodeAt(i), lastchar.size);
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
                        hPosition = char.x + (char._glyph.offset * char.size) + char.characterCaseOffset + char.trackingOffset();
                    }
                    this.lines.push(currentLine);
                    this.block.addChild(currentLine);
                    vPosition = 0;
                }
                else if (this.measured == true && this.singleLine === true && hPosition + char.measuredWidth > this.width && this.oversetPotential == true) {
                    this.oversetIndex = i;
                    this.overset = true;
                }
                else if (this.measured == false && this.singleLine === true && hPosition + char.measuredWidth > this.width) {
                    this.oversetIndex = i;
                    this.overset = true;
                }
                else {
                    char.x = hPosition;
                    currentLine.addChild(char);
                    hPosition = char.x + (char._glyph.offset * char.size) + char.characterCaseOffset + char.trackingOffset() + char._glyph.getKerning(this.getCharCodeAt(i + 1), char.size);
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
            var len = this.lines.length;
            for (var i = 0; i < len; i++) {
                line = this.lines[i];
                if (line.lastCharacter()) {
                    line.measuredWidth -= line.lastCharacter().trackingOffset();
                }
                if (this.original.line) {
                    if (this.original.line.added) {
                        line.on('added', this.original.line.added);
                    }
                    if (this.original.line.click) {
                        line.on('click', this.original.line.click);
                    }
                    if (this.original.line.dblclick) {
                        line.on('dblclick', this.original.line.dblclick);
                    }
                    if (this.original.line.mousedown) {
                        line.on('mousedown', this.original.line.mousedown);
                    }
                    if (this.original.line.mouseout) {
                        line.on('mouseout', this.original.line.mouseout);
                    }
                    if (this.original.line.mouseover) {
                        line.on('mouseover', this.original.line.mouseover);
                    }
                    if (this.original.line.pressmove) {
                        line.on('pressmove', this.original.line.pressmove);
                    }
                    if (this.original.line.pressup) {
                        line.on('pressup', this.original.line.pressup);
                    }
                    if (this.original.line.removed) {
                        line.on('removed', this.original.line.removed);
                    }
                    if (this.original.line.rollout) {
                        line.on('rollout', this.original.line.rollout);
                    }
                    if (this.original.line.rollover) {
                        line.on('rollover', this.original.line.rollover);
                    }
                    if (this.original.line.tick) {
                        line.on('tick', this.original.line.tick);
                    }
                }
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
            if (this.original.block) {
                if (this.original.block.added) {
                    this.block.on('added', this.original.block.added);
                }
                if (this.original.block.click) {
                    this.block.on('click', this.original.block.click);
                }
                if (this.original.block.dblclick) {
                    this.block.on('dblclick', this.original.block.dblclick);
                }
                if (this.original.block.mousedown) {
                    this.block.on('mousedown', this.original.block.mousedown);
                }
                if (this.original.block.mouseout) {
                    this.block.on('mouseout', this.original.block.mouseout);
                }
                if (this.original.block.mouseover) {
                    this.block.on('mouseover', this.original.block.mouseover);
                }
                if (this.original.block.pressmove) {
                    this.block.on('pressmove', this.original.block.pressmove);
                }
                if (this.original.block.pressup) {
                    this.block.on('pressup', this.original.block.pressup);
                }
                if (this.original.block.removed) {
                    this.block.on('removed', this.original.block.removed);
                }
                if (this.original.block.rollout) {
                    this.block.on('rollout', this.original.block.rollout);
                }
                if (this.original.block.rollover) {
                    this.block.on('rollover', this.original.block.rollover);
                }
                if (this.original.block.tick) {
                    this.block.on('tick', this.original.block.tick);
                }
            }
        };
        return CharacterText;
    })(createjs.Container);
    txt.CharacterText = CharacterText;
})(txt || (txt = {}));
var txt;
(function (txt) {
    (function (VerticalAlign) {
        VerticalAlign[VerticalAlign["Top"] = 0] = "Top";
        VerticalAlign[VerticalAlign["CapHeight"] = 1] = "CapHeight";
        VerticalAlign[VerticalAlign["Center"] = 2] = "Center";
        VerticalAlign[VerticalAlign["BaseLine"] = 3] = "BaseLine";
        VerticalAlign[VerticalAlign["Bottom"] = 4] = "Bottom";
        VerticalAlign[VerticalAlign["XHeight"] = 5] = "XHeight";
        VerticalAlign[VerticalAlign["Ascent"] = 6] = "Ascent";
        VerticalAlign[VerticalAlign["Percent"] = 7] = "Percent";
    })(txt.VerticalAlign || (txt.VerticalAlign = {}));
    var VerticalAlign = txt.VerticalAlign;
    ;
    var PathText = (function (_super) {
        __extends(PathText, _super);
        function PathText(props) {
            if (props === void 0) { props = null; }
            _super.call(this);
            this.text = "";
            this.characterCase = txt.Case.NORMAL;
            this.size = 12;
            this.font = "belinda";
            this.tracking = 0;
            this.ligatures = false;
            this.minSize = null;
            this.maxTracking = null;
            this.fillColor = "#000";
            this.strokeColor = null;
            this.strokeWidth = null;
            this.style = null;
            this.debug = false;
            this.original = null;
            this.autoExpand = false;
            this.autoReduce = false;
            this.overset = false;
            this.oversetIndex = null;
            this.pathPoints = null;
            this.path = "";
            this.start = 0;
            this.end = null;
            this.flipped = false;
            this.fit = txt.PathFit.Rainbow;
            this.align = txt.PathAlign.Center;
            this.valign = txt.VerticalAlign.BaseLine;
            this.missingGlyphs = null;
            this.renderCycle = true;
            this.valignPercent = 1;
            this.initialTracking = 0;
            this.initialOffset = 0;
            this.measured = false;
            this.oversetPotential = false;
            this.accessibilityText = null;
            this.accessibilityPriority = 2;
            this.accessibilityId = null;
            if (props) {
                this.original = props;
                this.set(props);
                this.original.tracking = this.tracking;
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
            this.pathPoints = new txt.Path(this.path, this.start, this.end, this.flipped, this.fit, this.align);
        }
        PathText.prototype.complete = function () { };
        PathText.prototype.setPath = function (path) {
            this.path = path;
            this.pathPoints.path = this.path;
            this.pathPoints.update();
        };
        PathText.prototype.setStart = function (start) {
            this.start = start;
            this.pathPoints.start = this.start;
            this.pathPoints.update();
        };
        PathText.prototype.setEnd = function (end) {
            this.end = end;
            this.pathPoints.end = this.end;
            this.pathPoints.update();
        };
        PathText.prototype.setFlipped = function (flipped) {
            this.flipped = flipped;
            this.pathPoints.flipped = this.flipped;
            this.pathPoints.update();
        };
        PathText.prototype.setFit = function (fit) {
            if (fit === void 0) { fit = txt.PathFit.Rainbow; }
            this.fit = fit;
            this.pathPoints.fit = this.fit;
            this.pathPoints.update();
        };
        PathText.prototype.setAlign = function (align) {
            if (align === void 0) { align = txt.PathAlign.Center; }
            this.align = align;
            this.pathPoints.align = this.align;
            this.pathPoints.update();
        };
        PathText.prototype.fontLoaded = function () {
            this.layout();
        };
        PathText.prototype.render = function () {
            this.getStage().update();
        };
        PathText.prototype.getWidth = function () {
            return this.pathPoints.realLength;
        };
        PathText.prototype.layout = function () {
            txt.Accessibility.set(this);
            this.overset = false;
            this.oversetIndex = null;
            this.removeAllChildren();
            this.characters = [];
            this.missingGlyphs = null;
            this.measured = false;
            this.oversetPotential = false;
            if (this.debug == true) {
                var s = new createjs.Shape();
                s.graphics.beginStroke("#FF0000");
                s.graphics.setStrokeStyle(0.1);
                s.graphics.decodeSVGPath(this.path);
                s.graphics.endFill();
                s.graphics.endStroke();
                this.addChild(s);
                s = new createjs.Shape();
                var pp = this.pathPoints.getRealPathPoint(0);
                s.x = pp.x;
                s.y = pp.y;
                s.graphics.beginFill("black");
                s.graphics.drawCircle(0, 0, 2);
                this.addChild(s);
                s = new createjs.Shape();
                var pp = this.pathPoints.getRealPathPoint(this.pathPoints.start);
                s.x = pp.x;
                s.y = pp.y;
                s.graphics.beginFill("green");
                s.graphics.drawCircle(0, 0, 2);
                this.addChild(s);
                s = new createjs.Shape();
                pp = this.pathPoints.getRealPathPoint(this.pathPoints.end);
                s.x = pp.x;
                s.y = pp.y;
                s.graphics.beginFill("red");
                s.graphics.drawCircle(0, 0, 2);
                this.addChild(s);
                s = new createjs.Shape();
                pp = this.pathPoints.getRealPathPoint(this.pathPoints.center);
                s.x = pp.x;
                s.y = pp.y;
                s.graphics.beginFill("blue");
                s.graphics.drawCircle(0, 0, 2);
                this.addChild(s);
            }
            if (this.text === "" || this.text === undefined) {
                this.render();
                return;
            }
            this.block = new createjs.Container();
            this.addChild(this.block);
            if (this.autoExpand === true || this.autoReduce === true) {
                if (this.measure() === false) {
                    this.removeAllChildren();
                    return;
                }
            }
            if (this.renderCycle === false) {
                this.removeAllChildren();
                this.complete();
                return;
            }
            if (this.characterLayout() === false) {
                this.removeAllChildren();
                return;
            }
            this.render();
            this.complete();
        };
        PathText.prototype.measure = function () {
            this.measured = true;
            var size = this.original.size;
            var len = this.text.length;
            var width = this.getWidth();
            var defaultStyle = {
                size: this.original.size,
                font: this.original.font,
                tracking: this.original.tracking,
                characterCase: this.original.characterCase
            };
            var currentStyle;
            var charCode = null;
            var font;
            var charMetrics = [];
            var largestFontSize = defaultStyle.size;
            for (var i = 0; i < len; i++) {
                charCode = this.text.charCodeAt(i);
                currentStyle = defaultStyle;
                if (this.original.style !== undefined && this.original.style[i] !== undefined) {
                    currentStyle = this.original.style[i];
                    if (currentStyle.size === undefined)
                        currentStyle.size = defaultStyle.size;
                    if (currentStyle.font === undefined)
                        currentStyle.font = defaultStyle.font;
                    if (currentStyle.tracking === undefined)
                        currentStyle.tracking = defaultStyle.tracking;
                }
                if (currentStyle.size > largestFontSize) {
                    largestFontSize = currentStyle.size;
                }
                font = txt.FontLoader.fonts[currentStyle.font];
                charMetrics.push({
                    char: this.text[i],
                    size: currentStyle.size,
                    charCode: charCode,
                    font: currentStyle.font,
                    offset: font.glyphs[charCode].offset,
                    units: font.units,
                    tracking: this.trackingOffset(currentStyle.tracking, currentStyle.size, font.units),
                    kerning: font.glyphs[charCode].getKerning(this.getCharCodeAt(i + 1), 1)
                });
            }
            var space = {
                char: " ",
                size: currentStyle.size,
                charCode: 32,
                font: currentStyle.font,
                offset: font.glyphs[32].offset,
                units: font.units,
                tracking: 0,
                kerning: 0
            };
            charMetrics[charMetrics.length - 1].tracking = 0;
            len = charMetrics.length;
            var metricBaseWidth = 0;
            var metricRealWidth = 0;
            var metricRealWidthTracking = 0;
            var current = null;
            for (var i = 0; i < len; i++) {
                current = charMetrics[i];
                metricBaseWidth = metricBaseWidth + current.offset + current.kerning;
                metricRealWidth = metricRealWidth + ((current.offset + current.kerning) * current.size);
                metricRealWidthTracking = metricRealWidthTracking +
                    ((current.offset + current.kerning + current.tracking) * current.size);
            }
            if (metricRealWidth > width) {
                if (this.autoReduce === true) {
                    this.tracking = 0;
                    this.size = this.original.size * width / (metricRealWidth + (space.offset * space.size));
                    if (this.minSize != null && this.size < this.minSize) {
                        this.size = this.minSize;
                        if (this.renderCycle === false) {
                            this.overset = true;
                        }
                        else {
                            this.oversetPotential = true;
                        }
                    }
                    return true;
                }
            }
            else {
                var trackMetric = this.offsetTracking((width - metricRealWidth) / (len), current.size, current.units);
                if (trackMetric < 0) {
                    trackMetric = 0;
                }
                if (trackMetric > this.original.tracking && this.autoExpand) {
                    if (this.maxTracking != null && trackMetric > this.maxTracking) {
                        this.tracking = this.maxTracking;
                    }
                    else {
                        this.tracking = trackMetric;
                    }
                    this.size = this.original.size;
                    return true;
                }
                if (trackMetric < this.original.tracking && this.autoReduce) {
                    if (this.maxTracking != null && trackMetric > this.maxTracking) {
                        this.tracking = this.maxTracking;
                    }
                    else {
                        this.tracking = trackMetric;
                    }
                    this.size = this.original.size;
                    return true;
                }
            }
            return true;
        };
        PathText.prototype.characterLayout = function () {
            var len = this.text.length;
            var char;
            var defaultStyle = {
                size: this.size,
                font: this.font,
                tracking: this.tracking,
                characterCase: this.characterCase,
                fillColor: this.fillColor,
                strokeColor: this.strokeColor,
                strokeWidth: this.strokeWidth
            };
            var currentStyle = defaultStyle;
            var hPosition = 0;
            var charKern;
            var tracking;
            var angle;
            for (var i = 0; i < len; i++) {
                if (this.style !== null && this.style[i] !== undefined) {
                    currentStyle = this.style[i];
                    if (currentStyle.size === undefined)
                        currentStyle.size = defaultStyle.size;
                    if (currentStyle.font === undefined)
                        currentStyle.font = defaultStyle.font;
                    if (currentStyle.tracking === undefined)
                        currentStyle.tracking = defaultStyle.tracking;
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
                if (hPosition == 0) {
                    hPosition = this.initialOffset + this.trackingOffset(this.initialTracking, currentStyle.size, txt.FontLoader.getFont(currentStyle.font).units);
                }
                char = new txt.Character(this.text.charAt(i), currentStyle, i);
                if (this.original.character) {
                    if (this.original.character.added) {
                        char.on('added', this.original.character.added);
                    }
                    if (this.original.character.click) {
                        char.on('click', this.original.character.click);
                    }
                    if (this.original.character.dblclick) {
                        char.on('dblclick', this.original.character.dblclick);
                    }
                    if (this.original.character.mousedown) {
                        char.on('mousedown', this.original.character.mousedown);
                    }
                    if (this.original.character.mouseout) {
                        char.on('mouseout', this.original.character.mouseout);
                    }
                    if (this.original.character.mouseover) {
                        char.on('mouseover', this.original.character.mouseover);
                    }
                    if (this.original.character.pressmove) {
                        char.on('pressmove', this.original.character.pressmove);
                    }
                    if (this.original.character.pressup) {
                        char.on('pressup', this.original.character.pressup);
                    }
                    if (this.original.character.removed) {
                        char.on('removed', this.original.character.removed);
                    }
                    if (this.original.character.rollout) {
                        char.on('rollout', this.original.character.rollout);
                    }
                    if (this.original.character.rollover) {
                        char.on('rollover', this.original.character.rollover);
                    }
                    if (this.original.character.tick) {
                        char.on('tick', this.original.character.tick);
                    }
                }
                if (char.missing) {
                    if (this.missingGlyphs == null) {
                        this.missingGlyphs = [];
                    }
                    this.missingGlyphs.push({ position: i, character: this.text.charAt(i), font: currentStyle.font });
                }
                if (currentStyle.tracking == 0 && this.ligatures == true) {
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
                if (this.overset == true) {
                    break;
                }
                else if (this.measured == true && hPosition + char.measuredWidth > this.getWidth() && this.oversetPotential == true) {
                    this.oversetIndex = i;
                    this.overset = true;
                    break;
                }
                else if (this.measured == false && hPosition + char.measuredWidth > this.getWidth()) {
                    this.oversetIndex = i;
                    this.overset = true;
                    break;
                }
                else {
                    char.hPosition = hPosition;
                    this.characters.push(char);
                    this.block.addChild(char);
                }
                hPosition = hPosition + (char._glyph.offset * char.size) + char.characterCaseOffset + char.trackingOffset() + char._glyph.getKerning(this.getCharCodeAt(i + 1), char.size);
            }
            len = this.characters.length;
            var pathPoint;
            var nextRotation = false;
            for (i = 0; i < len; i++) {
                char = this.characters[i];
                pathPoint = this.pathPoints.getPathPoint(char.hPosition, hPosition, char._glyph.offset * char.size);
                if (nextRotation == true) {
                    this.characters[i - 1].parent.rotation = pathPoint.rotation;
                    nextRotation = false;
                }
                if (pathPoint.next == true) {
                    nextRotation = true;
                }
                char.rotation = pathPoint.rotation;
                if (this.valign == txt.VerticalAlign.BaseLine) {
                    char.x = pathPoint.x;
                    char.y = pathPoint.y;
                    if (pathPoint.offsetX) {
                        var offsetChild = new createjs.Container();
                        offsetChild.x = pathPoint.x;
                        offsetChild.y = pathPoint.y;
                        offsetChild.rotation = pathPoint.rotation;
                        char.parent.removeChild(char);
                        offsetChild.addChild(char);
                        char.x = pathPoint.offsetX;
                        char.y = 0;
                        char.rotation = 0;
                        this.addChild(offsetChild);
                    }
                    else {
                        char.x = pathPoint.x;
                        char.y = pathPoint.y;
                        char.rotation = pathPoint.rotation;
                    }
                }
                else {
                    var offsetChild = new createjs.Container();
                    offsetChild.x = pathPoint.x;
                    offsetChild.y = pathPoint.y;
                    offsetChild.rotation = pathPoint.rotation;
                    char.parent.removeChild(char);
                    offsetChild.addChild(char);
                    char.x = 0;
                    if (this.valign == txt.VerticalAlign.Top) {
                        char.y = char.size;
                    }
                    else if (this.valign == txt.VerticalAlign.Bottom) {
                        char.y = char._font.descent / char._font.units * char.size;
                    }
                    else if (this.valign == txt.VerticalAlign.CapHeight) {
                        char.y = char._font['cap-height'] / char._font.units * char.size;
                    }
                    else if (this.valign == txt.VerticalAlign.XHeight) {
                        char.y = char._font['x-height'] / char._font.units * char.size;
                    }
                    else if (this.valign == txt.VerticalAlign.Ascent) {
                        char.y = char._font.ascent / char._font.units * char.size;
                    }
                    else if (this.valign == txt.VerticalAlign.Center) {
                        char.y = char._font['cap-height'] / char._font.units * char.size / 2;
                    }
                    else if (this.valign == txt.VerticalAlign.Percent) {
                        char.y = this.valignPercent * char.size;
                    }
                    else {
                        char.y = 0;
                    }
                    char.rotation = 0;
                    this.addChild(offsetChild);
                }
            }
            if (this.original.block) {
                if (this.original.block.added) {
                    this.block.on('added', this.original.block.added);
                }
                if (this.original.block.click) {
                    this.block.on('click', this.original.block.click);
                }
                if (this.original.block.dblclick) {
                    this.block.on('dblclick', this.original.block.dblclick);
                }
                if (this.original.block.mousedown) {
                    this.block.on('mousedown', this.original.block.mousedown);
                }
                if (this.original.block.mouseout) {
                    this.block.on('mouseout', this.original.block.mouseout);
                }
                if (this.original.block.mouseover) {
                    this.block.on('mouseover', this.original.block.mouseover);
                }
                if (this.original.block.pressmove) {
                    this.block.on('pressmove', this.original.block.pressmove);
                }
                if (this.original.block.pressup) {
                    this.block.on('pressup', this.original.block.pressup);
                }
                if (this.original.block.removed) {
                    this.block.on('removed', this.original.block.removed);
                }
                if (this.original.block.rollout) {
                    this.block.on('rollout', this.original.block.rollout);
                }
                if (this.original.block.rollover) {
                    this.block.on('rollover', this.original.block.rollover);
                }
                if (this.original.block.tick) {
                    this.block.on('tick', this.original.block.tick);
                }
            }
            return true;
        };
        PathText.prototype.trackingOffset = function (tracking, size, units) {
            return size * (2.5 / units + 1 / 900 + tracking / 990);
        };
        PathText.prototype.offsetTracking = function (offset, size, units) {
            return Math.floor((offset - 2.5 / units - 1 / 900) * 990 / size);
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
        return PathText;
    })(createjs.Container);
    txt.PathText = PathText;
})(txt || (txt = {}));
var txt;
(function (txt) {
    (function (PathFit) {
        PathFit[PathFit["Rainbow"] = 0] = "Rainbow";
        PathFit[PathFit["Stairstep"] = 1] = "Stairstep";
    })(txt.PathFit || (txt.PathFit = {}));
    var PathFit = txt.PathFit;
    ;
    (function (PathAlign) {
        PathAlign[PathAlign["Center"] = 0] = "Center";
        PathAlign[PathAlign["Right"] = 1] = "Right";
        PathAlign[PathAlign["Left"] = 2] = "Left";
    })(txt.PathAlign || (txt.PathAlign = {}));
    var PathAlign = txt.PathAlign;
    ;
    var Path = (function () {
        function Path(path, start, end, flipped, fit, align) {
            if (start === void 0) { start = 0; }
            if (end === void 0) { end = null; }
            if (flipped === void 0) { flipped = false; }
            if (fit === void 0) { fit = txt.PathFit.Rainbow; }
            if (align === void 0) { align = txt.PathAlign.Center; }
            this.pathElement = null;
            this.path = null;
            this.start = 0;
            this.center = null;
            this.end = null;
            this.angles = null;
            this.flipped = false;
            this.fit = txt.PathFit.Rainbow;
            this.align = txt.PathAlign.Center;
            this.length = null;
            this.realLength = null;
            this.closed = false;
            this.clockwise = true;
            this.path = path;
            this.start = start;
            this.align = align;
            this.end = end;
            this.flipped = flipped;
            this.fit = fit;
            this.update();
        }
        Path.prototype.update = function () {
            this.pathElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
            this.pathElement.setAttributeNS(null, "d", this.path);
            this.length = this.pathElement.getTotalLength();
            this.closed = (this.path.toLowerCase().indexOf('z') != -1);
            var pointlength = this.length / 10;
            var points = [];
            points.push(this.getRealPathPoint(0));
            points.push(this.getRealPathPoint(pointlength));
            points.push(this.getRealPathPoint(pointlength * 2));
            points.push(this.getRealPathPoint(pointlength * 3));
            points.push(this.getRealPathPoint(pointlength * 4));
            points.push(this.getRealPathPoint(pointlength * 5));
            points.push(this.getRealPathPoint(pointlength * 6));
            points.push(this.getRealPathPoint(pointlength * 7));
            points.push(this.getRealPathPoint(pointlength * 8));
            points.push(this.getRealPathPoint(pointlength * 9));
            points.push(this.getRealPathPoint(pointlength * 10));
            var clock = (points[1].x - points[0].x) * (points[1].y + points[0].y) + (points[2].x - points[1].x) * (points[2].y + points[1].y) + (points[3].x - points[2].x) * (points[3].y + points[2].y) + (points[4].x - points[3].x) * (points[4].y + points[3].y) + (points[5].x - points[4].x) * (points[5].y + points[4].y) + (points[6].x - points[5].x) * (points[6].y + points[5].y) + (points[7].x - points[6].x) * (points[7].y + points[6].y) + (points[8].x - points[7].x) * (points[8].y + points[7].y) + (points[9].x - points[8].x) * (points[9].y + points[8].y) + (points[10].x - points[9].x) * (points[10].y + points[9].y);
            if (clock > 0) {
                this.clockwise = false;
            }
            else {
                this.clockwise = true;
            }
            if (this.end == null) {
                this.end = this.length;
            }
            if (this.closed == false) {
                if (this.flipped == false) {
                    if (this.start > this.end) {
                        this.realLength = this.start - this.end;
                        this.center = this.start - this.realLength / 2;
                    }
                    else {
                        this.realLength = this.end - this.start;
                        this.center = this.start + this.realLength / 2;
                    }
                }
                else {
                    if (this.start > this.end) {
                        this.realLength = this.start - this.end;
                        this.center = this.start - this.realLength / 2;
                    }
                    else {
                        this.realLength = this.end - this.start;
                        this.center = this.start + this.realLength / 2;
                    }
                }
            }
            else if (this.clockwise == false) {
                if (this.flipped == false) {
                    if (this.start > this.end) {
                        this.realLength = this.start - this.end;
                        this.center = this.end + this.realLength / 2;
                    }
                    else {
                        this.realLength = (this.start + this.length - this.end);
                        this.center = this.end + this.realLength / 2;
                        if (this.center > this.length) {
                            this.center = this.center - this.length;
                        }
                    }
                }
                else {
                    if (this.start > this.end) {
                        this.realLength = (this.end + this.length - this.start);
                        this.center = this.start + this.realLength / 2;
                        if (this.center > this.length) {
                            this.center = this.center - this.length;
                        }
                    }
                    else {
                        this.realLength = this.end - this.start;
                        this.center = this.start + this.realLength / 2;
                    }
                }
            }
            else {
                if (this.flipped == false) {
                    if (this.start > this.end) {
                        this.realLength = this.end + this.length - this.start;
                        this.center = this.start + this.realLength / 2;
                        if (this.center > this.length) {
                            this.center = this.center - this.length;
                        }
                    }
                    else {
                        this.realLength = this.end - this.start;
                        this.center = this.start + this.realLength / 2;
                    }
                }
                else {
                    if (this.start > this.end) {
                        this.realLength = this.start - this.end;
                        this.center = this.end + this.realLength / 2;
                    }
                    else {
                        this.realLength = this.start + this.length - this.end;
                        this.center = this.end + this.realLength / 2;
                        if (this.center > this.length) {
                            this.center = this.center - this.length;
                        }
                    }
                }
            }
        };
        Path.prototype.getRealPathPoint = function (distance) {
            if (distance > this.length) {
                return this.pathElement.getPointAtLength(distance - this.length);
            }
            else if (distance < 0) {
                return this.pathElement.getPointAtLength(distance + this.length);
            }
            else {
                return this.pathElement.getPointAtLength(distance);
            }
        };
        Path.prototype.getPathPoint = function (distance, characterLength, charOffset) {
            if (characterLength === void 0) { characterLength = 0; }
            if (charOffset === void 0) { charOffset = 0; }
            distance = distance * 0.99;
            characterLength = characterLength * 0.99;
            var point0;
            var point1;
            var point2;
            var position;
            var direction = true;
            var realStart = 0;
            if (this.closed == false) {
                if (this.flipped == false) {
                    if (this.start > this.end) {
                        if (this.align == PathAlign.Left) {
                            realStart = this.start;
                        }
                        else if (this.align == PathAlign.Center) {
                            realStart = this.start - (this.realLength - characterLength) / 2;
                        }
                        else if (this.align == PathAlign.Right) {
                            realStart = this.start - this.realLength - characterLength;
                        }
                        position = realStart - distance;
                        direction = false;
                    }
                    else {
                        if (this.align == PathAlign.Left) {
                            realStart = this.start;
                        }
                        else if (this.align == PathAlign.Center) {
                            realStart = this.start + (this.realLength - characterLength) / 2;
                        }
                        else if (this.align == PathAlign.Right) {
                            realStart = this.start + this.realLength - characterLength;
                        }
                        position = realStart + distance;
                    }
                }
                else {
                    if (this.start > this.end) {
                        if (this.align == PathAlign.Left) {
                            realStart = this.start;
                        }
                        else if (this.align == PathAlign.Center) {
                            realStart = this.start - (this.realLength - characterLength) / 2;
                        }
                        else if (this.align == PathAlign.Right) {
                            realStart = this.start - this.realLength - characterLength;
                        }
                        position = realStart - distance;
                        direction = false;
                    }
                    else {
                        if (this.align == PathAlign.Left) {
                            realStart = this.start;
                        }
                        else if (this.align == PathAlign.Center) {
                            realStart = this.start + (this.realLength - characterLength) / 2;
                        }
                        else if (this.align == PathAlign.Right) {
                            realStart = this.start + this.realLength - characterLength;
                        }
                        position = realStart - distance;
                    }
                }
            }
            else if (this.clockwise == false) {
                if (this.flipped == false) {
                    if (this.start > this.end) {
                        if (this.align == PathAlign.Left) {
                            realStart = this.start;
                        }
                        else if (this.align == PathAlign.Center) {
                            realStart = this.start - (this.realLength - characterLength) / 2;
                        }
                        else if (this.align == PathAlign.Right) {
                            realStart = this.start - this.realLength - characterLength;
                        }
                        position = realStart - distance;
                        direction = false;
                    }
                    else {
                        if (this.align == PathAlign.Left) {
                            realStart = this.start;
                            position = realStart - distance;
                        }
                        else if (this.align == PathAlign.Center) {
                            realStart = this.start - (this.realLength - characterLength) / 2;
                            position = realStart - distance;
                        }
                        else if (this.align == PathAlign.Right) {
                            realStart = this.start - this.realLength - characterLength;
                            position = realStart - distance;
                        }
                        if (position < 0) {
                            position = position + this.length;
                        }
                        direction = false;
                    }
                }
                else {
                    if (this.start > this.end) {
                        if (this.align == PathAlign.Left) {
                            realStart = this.start;
                            position = realStart + distance;
                        }
                        else if (this.align == PathAlign.Center) {
                            realStart = this.start + (this.realLength - characterLength) / 2;
                            position = realStart + distance;
                        }
                        else if (this.align == PathAlign.Right) {
                            realStart = this.start + this.realLength - characterLength;
                            position = realStart + distance;
                        }
                        if (position > this.length) {
                            position = position - this.length;
                        }
                    }
                    else {
                        if (this.align == PathAlign.Left) {
                            realStart = this.start;
                        }
                        else if (this.align == PathAlign.Center) {
                            realStart = this.start + (this.realLength - characterLength) / 2;
                        }
                        else if (this.align == PathAlign.Right) {
                            realStart = this.start + this.realLength - characterLength;
                        }
                        position = realStart + distance;
                    }
                }
            }
            else {
                if (this.flipped == false) {
                    if (this.start > this.end) {
                        if (this.align == PathAlign.Left) {
                            realStart = this.start;
                            position = realStart - distance;
                        }
                        else if (this.align == PathAlign.Center) {
                            realStart = this.start - (this.realLength - characterLength) / 2;
                            position = realStart - distance;
                        }
                        else if (this.align == PathAlign.Right) {
                            realStart = this.start - this.realLength - characterLength;
                            position = realStart - distance;
                        }
                        if (position < 0) {
                            position = position + this.length;
                        }
                        direction = false;
                    }
                    else {
                        if (this.align == PathAlign.Left) {
                            realStart = this.start;
                        }
                        else if (this.align == PathAlign.Center) {
                            realStart = this.start - (this.realLength - characterLength) / 2;
                        }
                        else if (this.align == PathAlign.Right) {
                            realStart = this.start - this.realLength - characterLength;
                        }
                        position = realStart - distance;
                        direction = false;
                    }
                }
                else {
                    if (this.start > this.end) {
                        if (this.align == PathAlign.Left) {
                            realStart = this.start;
                        }
                        else if (this.align == PathAlign.Center) {
                            realStart = this.start + (this.realLength - characterLength) / 2;
                        }
                        else if (this.align == PathAlign.Right) {
                            realStart = this.start + this.realLength - characterLength;
                        }
                        position = realStart + distance;
                    }
                    else {
                        if (this.align == PathAlign.Left) {
                            realStart = this.start;
                            position = realStart + distance;
                        }
                        else if (this.align == PathAlign.Center) {
                            realStart = this.start + (this.realLength - characterLength) / 2;
                            position = realStart + distance;
                        }
                        else if (this.align == PathAlign.Right) {
                            realStart = this.start + this.realLength - characterLength;
                            position = realStart + distance;
                        }
                        if (position > this.length) {
                            position = position - this.length;
                        }
                    }
                }
            }
            point1 = this.getRealPathPoint(position);
            var segment = this.pathElement.pathSegList.getItem(this.pathElement.getPathSegAtLength(position)).pathSegType;
            if (segment == 4) {
                if (direction) {
                }
                else {
                    if (this.pathElement.getPathSegAtLength(position) != this.pathElement.getPathSegAtLength(position - charOffset)) {
                        var pp0 = this.getRealPathPoint(position);
                        var pp1 = this.getRealPathPoint(position - charOffset);
                        var ppc = this.pathElement.pathSegList.getItem(this.pathElement.getPathSegAtLength(position) - 1);
                        var d0 = Math.sqrt(Math.pow((pp0.x - ppc['x']), 2) + Math.pow((pp0.y - ppc['y']), 2));
                        var d1 = Math.sqrt(Math.pow((pp1.x - ppc['x']), 2) + Math.pow((pp1.y - ppc['y']), 2));
                        if (d0 > d1) {
                            point1 = pp0;
                            point2 = { x: ppc['x'], y: ppc['y'] };
                            var rot12 = Math.atan((point2.y - point1.y) / (point2.x - point1.x)) * 180 / Math.PI;
                            if (point1.x > point2.x) {
                                rot12 = rot12 + 180;
                            }
                            if (rot12 < 0) {
                                rot12 = rot12 + 360;
                            }
                            if (rot12 > 360) {
                                rot12 = rot12 - 360;
                            }
                            point1.rotation = rot12;
                            return point1;
                        }
                        else {
                            point1 = { x: ppc['x'], y: ppc['y'] };
                            point1.offsetX = -d0;
                            point1['next'] = true;
                            return point1;
                        }
                    }
                }
            }
            if (direction) {
                point2 = this.getRealPathPoint(position + charOffset);
            }
            else {
                point2 = this.getRealPathPoint(position - charOffset);
            }
            var rot12 = Math.atan((point2.y - point1.y) / (point2.x - point1.x)) * 180 / Math.PI;
            if (point1.x > point2.x) {
                rot12 = rot12 + 180;
            }
            if (rot12 < 0) {
                rot12 = rot12 + 360;
            }
            if (rot12 > 360) {
                rot12 = rot12 - 360;
            }
            point1.rotation = rot12;
            return point1;
        };
        return Path;
    })();
    txt.Path = Path;
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
