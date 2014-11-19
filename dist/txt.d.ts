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
        _glyph: Glyph;
        _font: Font;
        constructor(character: string, style: {}, index?: number, glyph?: Glyph);
        setGlyph(glyph: Glyph): void;
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
        static getFont(name: string): Font;
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
        font: string;
        tracking: number;
        ligatures: boolean;
        fillColor: string;
        strokeColor: string;
        strokeWidth: number;
        autoSize: boolean;
        loaderId: number;
        style: Style[];
        debug: boolean;
        lines: Line[];
        block: createjs.Container;
        constructor(props?: ConstructObj);
        complete(): void;
        fontLoaded(): void;
        render(): void;
        layout(): void;
        autoSizeMeasure(count?: number): void;
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
        fillColor: string;
        strokeColor: string;
        strokeWidth: number;
        style: Style[];
        debug: boolean;
        points: any[];
        characters: Character[];
        path: string;
        start: number;
        center: number;
        end: number;
        flipped: boolean;
        static DISTANCE: number;
        block: createjs.Container;
        constructor(props?: ConstructObj);
        fontLoaded(): void;
        render(): void;
        layout(): void;
        characterLayout(): boolean;
        getCharCodeAt(index: number): number;
        pathToPoints(): any[];
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
        lastCharacter(): Character;
    }
}
declare module txt {
    class Line extends createjs.Container {
        measuredWidth: number;
        measuredHeight: number;
        constructor();
        lastWord(): Word;
        lastCharacter(): Character;
    }
}
