module txt {

    export class FontLoader{

        static path:string = "/font/";

        static cache:boolean = false;

        static version:number = 0;

        static fonts:any = {};

        static loaders:any = [];

        static isLoaded( name:string ):boolean {
            if( txt.FontLoader.fonts.hasOwnProperty( name ) ){
                return txt.FontLoader.fonts[ name ].loaded;
            }
            return false;
        }

        static getFont( name:string ):txt.Font {
            if( txt.FontLoader.fonts.hasOwnProperty( name ) ){
                return txt.FontLoader.fonts[ name ];
            }
            return null;
        }

        static load( target:any , fonts:string[] ) {
            //no loaderId implies no loading for this txt field
            var loader:any;
            if( target.loaderId == null ){
                loader = {};
                target.loaderId = txt.FontLoader.loaders.push( loader ) - 1;
                loader._id = target.loaderId;
                loader._target = target;
            }else{
                loader = txt.FontLoader.loaders[ target.loaderId ];
            }
            var fontCount = fonts.length;
            for( var i = 0; i < fontCount; ++i ){
                //mark loader for font loading
                loader[ fonts[i] ] = false;
            }
            for( var prop in loader ){
                if( prop.charAt(0) != "_" ){
                    txt.FontLoader.loadFont( prop , loader );
                }
            }
        }

        static check( id:number ){
            var loader = txt.FontLoader.loaders[ id ];
            //determine if all fonts are loaded
            for( var prop in loader ){
                if( prop.charAt(0) != "_" ){
                    loader[prop] = txt.FontLoader.isLoaded( prop )
                    if( loader[prop] == false ) return;
                }
            }
            window.setTimeout ( function(){ loader._target.fontLoaded(); } , 1 );
        }

        static loadFont( fontName:string , loader:any ){
            var fonts = txt.FontLoader.fonts;
            
            //determine if font exists in memory
            if( txt.FontLoader.fonts.hasOwnProperty( fontName ) ){
                
                //loading complete
                if( txt.FontLoader.fonts[ fontName ].loaded === true ){
                    txt.FontLoader.check( loader._id );

                //loading not complete
                }else{
                    //add loader id to font
                    txt.FontLoader.fonts[ fontName ].targets.push( loader._id );
                }

            //load from scratch
            }else{
                var font:txt.Font = txt.FontLoader.fonts[ fontName ] = new txt.Font()
                font.targets.push( loader._id );

                //TODO localstorage check & get
                var req:any = new XMLHttpRequest();

                if( localStorage && txt.FontLoader.cache ){
                    var local = JSON.parse( localStorage.getItem( 'txt_font_' + fontName.split(' ').join('_') ) );
                    if( local != null ){
                        if( local.version === txt.FontLoader.version ){
                            req.cacheResponseText = local.font;
                            req.cacheFont = true;
                        }
                    }
                }

                req.onload = function(){
                    
                    //localstorage set
                    if( localStorage && txt.FontLoader.cache && this.cacheFont == undefined ){
                        localStorage.setItem( 'txt_font_' + fontName.split(' ').join('_') , JSON.stringify( { font:this.responseText, version:txt.FontLoader.version } ) );
                    }

                    var lines = this.responseText.split( '\n' );
                    //use cacheResponseText as responseText is readonly via XHR
                    if( this.cacheResponseText ){
                        lines = this.cacheResponseText.split( '\n' );
                    }
                    var len = lines.length;
                    var i = 0;
                    var line:string[];
                    var glyph:txt.Glyph;
                    while( i < len ){
                        line = lines[ i ].split( "|" );
                        switch( line[ 0 ] ){

                            case '0':
                                //properties
                                if( line[ 1 ] == 'id' || line[ 1 ] == 'panose'  || line[ 1 ] == 'family' || line[ 1 ] == 'font-style' || line[ 1 ] == 'font-stretch' ){
                                    font[ line[ 1 ] ] = line[ 2 ];
                                }else{
                                    font[ line[ 1 ] ] = parseInt( line[ 2 ] );
                                }
                                break;

                            case '1':
                                //glyphs
                                
                                glyph = new txt.Glyph();
                                glyph.offset = parseInt( line[ 2 ] ) / font.units;
                                glyph.path = line[ 3 ]; 
                                font.glyphs[ line[ 1 ] ] = glyph;
                                break;

                            case '2':
                                //kerning                            
                                if( font.kerning[ line[ 1 ] ] == undefined ){
                                    font.kerning[ line[ 1 ] ] = {};
                                }
                                if( font.glyphs[ line[ 1 ] ] == undefined ){
                                    glyph = new txt.Glyph();
                                    glyph.offset = font.default / font.units;
                                    glyph.path = '';
                                    font.glyphs[ line[ 1 ] ] = glyph;
                                }
                                font.glyphs[ line[ 1 ] ].kerning[ line[ 2 ] ] = parseInt( line[ 3 ] ) / font.units;
                                font.kerning[ line[ 1 ] ][ line[ 2 ] ] = parseInt( line[ 3 ] ) / font.units;
                                break;

                            case '3':
                                line.shift();
                                var lineLen = line.length;
                                for( var j = 0; j < lineLen; j++ ){
                                    var path = line[ j ].split("");
                                    var pathLength = path.length;
                                    var target = font.ligatures;
                                    for( var k = 0; k < pathLength; k++ ){
                                        if( target[ path[ k ] ] == undefined ){
                                            target[ path[ k ] ] = {}
                                        }
                                        if( k == pathLength - 1 ){
                                            target[ path[ k ] ].glyph = font.glyphs[ line[ j ] ]
                                        }

                                        target = target[ path[ k ] ];
                                    }
                                    //font.ligatures[ line[ j ] ] = font.glyphs[ line[j] ]
                                }
                                break;
                        }
                        i++;
                    }
                    //character cloning
                    //clone bullet into multiple areas
                    font.cloneGlyph( 183 , 8226 );
                    font.cloneGlyph( 8729 , 8226 );
                    font.cloneGlyph( 12539 , 8226 );
                    font.cloneGlyph( 9702 , 8226 );
                    font.cloneGlyph( 9679 , 8226 );
                    font.cloneGlyph( 9675 , 8226 );

                    //define font adjustment values for font.top, font.middle, font.bottom
                    if( font.top == undefined ){
                        font.top = 0;
                    }
                    if( font.middle == undefined ){
                        font.middle = 0;
                    }
                    if( font.bottom == undefined ){
                        font.bottom = 0;
                    }


                    //level the font metadata
                    var lLen = font.targets.length;
                    font.loaded = true;
                    for( var l = 0; l < lLen; ++l ){
                        txt.FontLoader.check( font.targets[ l ] );
                    }
                    font.targets = [];
                }
                //check if cached
                if( req.cacheFont == true ){
                    req.onload();
                }else{
                    req.open( "get" , txt.FontLoader.path + fontName.split( " " ).join( '_' ) + '.txt' , true );
                    req.send();
                }
            }
        }
    }
}