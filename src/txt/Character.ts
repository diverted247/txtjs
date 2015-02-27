module txt {

    export class Character extends createjs.Shape {
        
        character:string = '';
        characterCode:number = null;
        font:string = null;
        tracking:number = null;
        characterCase:number = null;
        characterCaseOffset:number = 0;
        index:number = null;
        size:number = null;
        fillColor:string = null;
        strokeColor:string = null;
        strokeWidth:number = null;
        measuredWidth:number = null;
        measuredHeight:number = null;
        hPosition:number = null;
        missing:boolean = false;

        _glyph:txt.Glyph;
        _font:txt.Font;
        

        constructor( character:string , style:{} , index:number=null , glyph:txt.Glyph=null ){
            super();
            this.set( style );
            this.index = index;

            // flip case depending on characterCase property
            if( this.characterCase == txt.Case.NORMAL ){
                this.character = character;
            }else if( this.characterCase == txt.Case.UPPER ){
                this.character = character.toUpperCase();
            }else if( this.characterCase == txt.Case.LOWER ){
                this.character = character.toLowerCase();
            }else if( this.characterCase == txt.Case.SMALL_CAPS ){
                this.character = character.toUpperCase();
                var upperSmall = !( character === this.character );
            }else{
                //fallback case for unknown.
                this.character = character;
            }
            this.characterCode = this.character.charCodeAt( 0 );



            this._font = txt.FontLoader.getFont( this.font );
            
            if( this._font.glyphs[ this.characterCode ] ){
                this._glyph = this._font.glyphs[ this.characterCode ];

            //flip lower
            }else if( this._font.glyphs[ String.fromCharCode( this.characterCode ).toLowerCase().charCodeAt( 0 ) ] ){
                this._glyph = this._font.glyphs[ String.fromCharCode( this.characterCode ).toLowerCase().charCodeAt( 0 ) ];

            //flip upper
            }else if( this._font.glyphs[ String.fromCharCode( this.characterCode ).toUpperCase().charCodeAt( 0 ) ] ){
                this._glyph = this._font.glyphs[ String.fromCharCode( this.characterCode ).toUpperCase().charCodeAt( 0 ) ];
            }
            
            //missing glyph
            if( this._glyph === undefined ){
                console.log( "MISSING GLYPH:" + this.character );
                this._glyph = this._font.glyphs[ 42 ];
                this.missing = true;
            }
            this.graphics = this._glyph.graphic();

            if( this.characterCase === txt.Case.SMALL_CAPS ){
                if( upperSmall ){
                    this.scaleX = this.size / this._font.units * 0.8;
                    this.characterCaseOffset = -0.2 * ( this._glyph.offset * this.size );
                }else{
                    this.scaleX = this.size / this._font.units;
                }
            }else{
                this.scaleX = this.size / this._font.units;
            }

            this.scaleY = -this.scaleX;

            this.measuredHeight = ( this._font.ascent - this._font.descent ) * this.scaleX;
            this.measuredWidth = this.scaleX * this._glyph.offset * this._font.units;
            
            var ha = new createjs.Shape();
            ha.graphics.drawRect( 0 , this._font.descent , this._glyph.offset * this._font.units , this._font.ascent - this._font.descent );
            this.hitArea = ha;
            
        }

        setGlyph( glyph:txt.Glyph ){
            this._glyph = glyph;
            this.graphics = this._glyph.graphic();
        }

        trackingOffset():number {
            return this.size * ( 2.5 / this._font.units + 1 / 900 + this.tracking / 990 );
        }

        draw( ctx:CanvasRenderingContext2D ):boolean {
            this._glyph._fill.style = this.fillColor;
            this._glyph._fill.matrix = null;
            this._glyph._stroke.style = this.strokeColor;
            this._glyph._strokeStyle.width = this.strokeWidth;
            return this._glyph.draw( ctx );
        }

        getWidth(){
            return this.size * this._glyph.offset;
        }

    }
}