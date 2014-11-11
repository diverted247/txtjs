module txt {

    export class Font{
        glyphs:any = {};
        kerning:any = {};
        missing:number;
        offset:number;
        default:number;
        descent:number;
        ascent:number;
        top:number = 0;
        middle:number = 0;
        bottom:number = 0;
        units:number = 1000;
        id:string;
        ligatures:any = {};
        panose:string;
        alphabetic:string;
        loaded:boolean = false;
        targets:number[] = [];
        loader:XMLHttpRequest;

        cloneGlyph( target:number , from:number ){
            if( this.glyphs[ target ] == undefined && this.glyphs[ from ] != undefined ){
                this.glyphs[ target ] = this.glyphs[ from ];
                this.kerning[ target ] = this.kerning[ from ];
            }
        }
    }
    
}