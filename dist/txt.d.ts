declare module txt {
    interface Style {
        size: number;
        font: string;
        tracking: number;
        characterCase: number;
        fillColor: string;
        strokeColor: string;
        strokeWidth: number;
    }
    interface ConstructObj {
        text: string;
        style?: Style[];
        align?: number;
        size?: number;
        height?: number;
        width?: number;
        lineHeight?: number;
        font?: string;
        tracking?: number;
        characterCase?: number;
        fillColor?: string;
        strokeColor?: string;
        strokeWidth?: number;
        debug?: boolean;
    }
    interface Point {
        x: number;
        y: number;
    }
}
declare module txt {
    class Accessibility {
        static data: any;
        static timeout: any;
        static set(element: any): void;
        static update(): void;
        static clear(): void;
    }
}
declare module txt {
    class Text extends createjs.Container {
        text: string;
        lineHeight: number;
        width: number;
        height: number;
        align: number;
        characterCase: number;
        size: number;
        font: string;
        tracking: number;
        ligatures: boolean;
        fillColor: string;
        strokeColor: string;
        strokeWidth: number;
        loaderId: number;
        style: Style[];
        debug: boolean;
        words: Word[];
        lines: Line[];
        block: createjs.Container;
        missingGlyphs: any[];
        accessibilityText: string;
        accessibilityPriority: number;
        accessibilityId: number;
        constructor(props?: ConstructObj);
        render(): void;
        complete(): void;
        fontLoaded(font: any): void;
        layout(): void;
        characterLayout(): boolean;
        wordLayout(): void;
        lineLayout(): void;
    }
}
declare module txt {
    class Character extends createjs.Shape {
        character: string;
        characterCode: number;
        font: string;
        tracking: number;
        characterCase: number;
        characterCaseOffset: number;
        index: number;
        size: number;
        fillColor: string;
        strokeColor: string;
        strokeWidth: number;
        measuredWidth: number;
        measuredHeight: number;
        hPosition: number;
        missing: boolean;
        _glyph: txt.Glyph;
        _font: txt.Font;
        constructor(character: string, style: {}, index?: number, glyph?: txt.Glyph);
        setGlyph(glyph: txt.Glyph): void;
        trackingOffset(): number;
        draw(ctx: CanvasRenderingContext2D): boolean;
        getWidth(): number;
    }
}
declare module txt {
    class Font {
        glyphs: any;
        kerning: any;
        missing: number;
        offset: number;
        default: number;
        descent: number;
        ascent: number;
        top: number;
        middle: number;
        bottom: number;
        units: number;
        id: string;
        ligatures: any;
        panose: string;
        alphabetic: string;
        loaded: boolean;
        targets: number[];
        loader: XMLHttpRequest;
        cloneGlyph(target: number, from: number): void;
    }
}
declare module txt {
    class Glyph {
        path: string;
        offset: number;
        kerning: any;
        private _graphic;
        _fill: createjs.Graphics.Fill;
        _stroke: createjs.Graphics.Stroke;
        _strokeStyle: createjs.Graphics.StrokeStyle;
        graphic(): createjs.Graphics;
        draw(ctx: CanvasRenderingContext2D): boolean;
        getKerning(characterCode: number, size: number): number;
    }
}
declare module txt {
    class FontLoader {
        static path: string;
        static fonts: any;
        static loaders: any;
        static isLoaded(name: string): boolean;
        static getFont(name: string): txt.Font;
        static load(target: any, fonts: string[]): void;
        static check(id: number): void;
        static loadFont(fontName: string, loader: any): void;
    }
}
declare module txt {
    class Graphics {
        static init(target: any, svgpath: string): void;
        static parsePathData(data: any): any[];
    }
}
declare module createjs.Graphics {
    class SVGArc {
        r0: number;
        r1: number;
        cx: number;
        cy: number;
        phi: number;
        rx: number;
        ry: number;
        start: number;
        end: number;
        fS: boolean;
        x2: number[];
        mag(v: any): number;
        meanVec(u: any, v: any): number[];
        dot(u: any, v: any): number;
        ratio(u: any, v: any): number;
        rotClockwise(v: any, angle: any): number[];
        pointMul(u: any, v: any): number[];
        scale(c: any, v: any): number[];
        sum(u: any, v: any): any[];
        angle(u: any, v: any): number;
        rotCounterClockwise(v: any, angle: any): number[];
        midPoint(u: any, v: any): number[];
        constructor(x1: number[], rx: number, ry: number, phi: number, fA: boolean, fS: boolean, x2: number[]);
        exec(ctx: CanvasRenderingContext2D): void;
    }
}
declare module txt {
    class Case {
        static NORMAL: number;
        static UPPER: number;
        static LOWER: number;
        static SMALL_CAPS: number;
    }
}
declare module txt {
    class Align {
        static TOP_LEFT: number;
        static TOP_CENTER: number;
        static TOP_RIGHT: number;
        static MIDDLE_LEFT: number;
        static MIDDLE_CENTER: number;
        static MIDDLE_RIGHT: number;
        static BOTTOM_LEFT: number;
        static BOTTOM_CENTER: number;
        static BOTTOM_RIGHT: number;
        static TL: number;
        static TC: number;
        static TR: number;
        static ML: number;
        static MC: number;
        static MR: number;
        static BL: number;
        static BC: number;
        static BR: number;
    }
}
declare module txt {
    class CharacterText extends createjs.Container {
        text: string;
        lineHeight: number;
        width: number;
        height: number;
        align: number;
        characterCase: number;
        size: number;
        minSize: number;
        maxTracking: number;
        font: string;
        tracking: number;
        ligatures: boolean;
        fillColor: string;
        strokeColor: string;
        strokeWidth: number;
        singleLine: boolean;
        autoExpand: boolean;
        autoReduce: boolean;
        overset: boolean;
        oversetIndex: number;
        loaderId: number;
        style: Style[];
        debug: boolean;
        original: ConstructObj;
        lines: Line[];
        block: createjs.Container;
        missingGlyphs: any[];
        accessibilityText: string;
        accessibilityPriority: number;
        accessibilityId: number;
        constructor(props?: ConstructObj);
        complete(): void;
        fontLoaded(): void;
        render(): void;
        layout(): void;
        measure(): boolean;
        trackingOffset(tracking: number, size: number, units: number): number;
        offsetTracking(offset: number, size: number, units: number): number;
        getWidth(): number;
        characterLayout(): boolean;
        getCharCodeAt(index: number): number;
        lineLayout(): void;
    }
}
declare module txt {
    class PathText extends createjs.Container {
        text: string;
        characterCase: number;
        size: number;
        font: string;
        tracking: number;
        ligatures: boolean;
        minSize: number;
        maxTracking: number;
        fillColor: string;
        strokeColor: string;
        strokeWidth: number;
        style: Style[];
        debug: boolean;
        characters: txt.Character[];
        block: createjs.Container;
        original: ConstructObj;
        autoExpand: boolean;
        autoReduce: boolean;
        overset: boolean;
        oversetIndex: number;
        pathPoints: txt.Path;
        path: string;
        start: number;
        end: number;
        flipped: boolean;
        fit: PathFit;
        align: PathAlign;
        missingGlyphs: any[];
        accessibilityText: string;
        accessibilityPriority: number;
        accessibilityId: number;
        constructor(props?: ConstructObj);
        setPath(path: string): void;
        setStart(start: number): void;
        setEnd(end: number): void;
        setFlipped(flipped: boolean): void;
        setFit(fit?: txt.PathFit): void;
        setAlign(align?: PathAlign): void;
        fontLoaded(): void;
        render(): void;
        getWidth(): number;
        layout(): void;
        measure(): boolean;
        characterLayout(): boolean;
        trackingOffset(tracking: number, size: number, units: number): number;
        offsetTracking(offset: number, size: number, units: number): number;
        getCharCodeAt(index: number): number;
    }
}
declare module txt {
    enum PathFit {
        Rainbow = 0,
        Stairstep = 1,
    }
    interface PathPoint {
        x: number;
        y: number;
        rotation?: number;
        offsetX?: number;
    }
    enum PathAlign {
        Center = 0,
        Right = 1,
        Left = 2,
    }
    class Path {
        private pathElement;
        path: string;
        start: number;
        center: number;
        end: number;
        angles: any[];
        flipped: boolean;
        fit: PathFit;
        align: PathAlign;
        length: number;
        realLength: number;
        closed: boolean;
        clockwise: boolean;
        constructor(path: string, start?: number, end?: number, flipped?: boolean, fit?: PathFit, align?: PathAlign);
        update(): void;
        getRealPathPoint(distance: number): txt.PathPoint;
        getPathPoint(distance: number, characterLength?: number, charOffset?: number): txt.PathPoint;
    }
}
declare module txt {
    class Word extends createjs.Container {
        hasNewLine: boolean;
        hasHyphen: boolean;
        hasSpace: boolean;
        measuredWidth: number;
        measuredHeight: number;
        spaceOffset: number;
        constructor();
        lastCharacter(): txt.Character;
    }
}
declare module txt {
    class Line extends createjs.Container {
        measuredWidth: number;
        measuredHeight: number;
        constructor();
        lastWord(): txt.Word;
        lastCharacter(): txt.Character;
    }
}
