module txt {

    export class PathText extends createjs.Container {
    
        text:string = "";
        characterCase:number = txt.Case.NORMAL;
        size:number = 12;
        font:string = "belinda";
        spacing:number = 0;
        ligatures:boolean = false;
        fillColor:string = "#000";
        strokeColor:string = null;
        strokeWidth:number = null;
        style:Style[] = null;
        debug:boolean = false;
        points:any[];
        characters:txt.Character[];
        path:string = "";
        start:number = 0;
        center:number = null;
        end:number = null;
        flipped:boolean = false;

        static DISTANCE:number = 0.1;
            

        block:createjs.Container;

        constructor( props:ConstructObj = null ){
            super();
            if( props ){
                this.set( props );
            }
            
            if( this.style == null ){
                txt.FontLoader.load( this , [ this.font ] );
            }else{
                var fonts = [ this.font ];
                var styleLength = this.style.length;
                for( var i = 0; i < styleLength; ++i ){
                    if( this.style[ i ] != undefined ){
                        if( this.style[ i ].font != undefined ){
                            fonts.push( this.style[ i ].font );
                        }
                    }
                }
                txt.FontLoader.load( this , fonts );
            }
            this.points = this.pathToPoints();
        }

        fontLoaded(){
            this.layout();
        }

        render(){
            this.getStage().update();
        }

        layout(){
            this.removeAllChildren();
            this.characters = [];

            if( this.debug == true ){
                var s = new createjs.Shape();
                s.graphics.beginStroke( "#FF0000" );
                s.graphics.setStrokeStyle( 0.1 );
                s.graphics.decodeSVGPath( this.path );
                this.addChild( s );
            }

            if( this.text === "" || this.text === undefined ){
                this.render();
                return;
            }

            this.block = new createjs.Container()
            this.addChild( this.block );
            if( this.characterLayout() === false ){
                this.removeAllChildren();
                return;
            }
            this.render();
        }

        //place characters in words
        characterLayout():boolean {
            //char layout
            var len = this.text.length;
            var char:Character;
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
            var hPosition:number = 0;
            var charKern:number;
            var spacing:number;
            var point:any[];
            var p0Distance:number;
            var p0:Point;
            var p1:Point;
            var p2:Point;
            var angle:number;
            var pathDistance:number = txt.PathText.DISTANCE;
            var pointLength:number = this.points.length;

            // loop over characters
            // place into lines
            for( var i = 0 ; i < len ; i++ ){
                
                if( this.style !== null && this.style[ i ] !== undefined ){
                    currentStyle = this.style[ i ];
                    // make sure style contains properties needed.
                    if( currentStyle.size === undefined ) currentStyle.size = defaultStyle.size;
                    if( currentStyle.font === undefined ) currentStyle.font = defaultStyle.font;
                    if( currentStyle.spacing === undefined ) currentStyle.spacing = defaultStyle.spacing;
                    if( currentStyle.characterCase === undefined ) currentStyle.characterCase = defaultStyle.characterCase;
                    if( currentStyle.fillColor === undefined ) currentStyle.fillColor = defaultStyle.fillColor;
                    if( currentStyle.strokeColor === undefined ) currentStyle.strokeColor = defaultStyle.strokeColor;
                    if( currentStyle.strokeWidth === undefined ) currentStyle.strokeWidth = defaultStyle.strokeWidth;
                }

                // newline
                if( this.text.charAt( i ) == "\n" ){
                    continue;
                }

                //runtime test for font
                if( txt.FontLoader.isLoaded( currentStyle.font ) === false ){
                    txt.FontLoader.load( this , [ currentStyle.font ] );
                    return false;
                }

                // create character
                char = new Character( this.text.charAt( i ) , currentStyle , i );

                //swap character if ligature
                //ligatures removed if spacing or this.ligatures is false
                if( currentStyle.spacing == 0 && this.ligatures == true ){
                    //1 char match
                    var ligTarget = this.text.substr( i , 4 );
                    if( char._font.ligatures[ ligTarget.charAt( 0 ) ] ){
                        //2 char match
                        if( char._font.ligatures[ ligTarget.charAt( 0 ) ][ ligTarget.charAt( 1 ) ] ){
                            //3 char match
                            if( char._font.ligatures[ ligTarget.charAt( 0 ) ][ ligTarget.charAt( 1 ) ][ ligTarget.charAt( 2 ) ] ){
                                //4 char match
                                if( char._font.ligatures[ ligTarget.charAt( 0 ) ][ ligTarget.charAt( 1 ) ][ ligTarget.charAt( 2 ) ][ ligTarget.charAt( 3 ) ] ){
                                    //swap 4 char ligature
                                    char.setGlyph( char._font.ligatures[ ligTarget.charAt( 0 ) ][ ligTarget.charAt( 1 ) ][ ligTarget.charAt( 2 ) ][ ligTarget.charAt( 3 ) ].glyph );
                                    i = i+3;
                                }else{
                                    //swap 3 char ligature
                                    char.setGlyph( char._font.ligatures[ ligTarget.charAt( 0 ) ][ ligTarget.charAt( 1 ) ][ ligTarget.charAt( 2 ) ].glyph );
                                    i = i+2;
                                }
                            }else{
                                //swap 2 char ligature
                                char.setGlyph( char._font.ligatures[ ligTarget.charAt( 0 ) ][ ligTarget.charAt( 1 ) ].glyph );
                                i = i+1;
                            }
                        }
                    }
                }

                char.hPosition = hPosition;

                // push character into block
                this.characters.push( char );
                this.block.addChild( char );
                hPosition = hPosition + ( char._glyph.offset * char.size ) + char.characterCaseOffset + char.spacingOffset() + char._glyph.getKerning( this.getCharCodeAt( i + 1 ) , char.size );

            }

            var offsetStart = Math.round( ( pointLength * pathDistance - hPosition ) / 2 ) ;
            len = this.characters.length;
            for( i = 0; i < len; i++ ){
                char = <txt.Character>this.characters[ i ];
                p0Distance = Math.round( ( offsetStart + char.hPosition ) / pathDistance );
                p0 = this.points[ p0Distance ];
                if( p0 == undefined ){
                    break;
                }
                char.x = p0.x;
                char.y = p0.y;
                p0 = this.points[ p0Distance + 15 ];

                if( i + 35 < pointLength ){
                    p1 = this.points[ p0Distance + 35 ];
                    angle = Math.atan( ( p0.y - p1.y ) / ( p0.x - p1.x ) ) * 180 / Math.PI;
                    // left
                    if( p0.x >= p1.x ){
                        angle = angle + 180;
                    }
                }else{
                    p1 = this.points[ p0Distance - 35 ];
                    angle = Math.atan( ( p1.y - p0.y ) / ( p1.x - p0.x ) ) * 180 / Math.PI;
                    // left
                    if( p1.x >= p0.x ){
                        angle = angle + 180;
                    }
                }

                char.rotation = angle;
            }
            return true;

        }

        getCharCodeAt( index:number ):number {
            if( this.characterCase == txt.Case.NORMAL ){
                return this.text.charAt( index ).charCodeAt( 0 );

            }else if( this.characterCase == txt.Case.UPPER ){
                return this.text.charAt( index ).toUpperCase().charCodeAt( 0 );

            }else if( this.characterCase == txt.Case.LOWER ){
                return this.text.charAt( index ).toLowerCase().charCodeAt( 0 );

            }else if( this.characterCase == txt.Case.SMALL_CAPS ){
                return this.text.charAt( index ).toUpperCase().charCodeAt( 0 );

            }else{
                //fallback case for unknown.
                return this.text.charAt( index ).charCodeAt( 0 );
            }
        }

        

        pathToPoints():any[]{
            var path = <SVGPathElement>document.createElementNS( "http://www.w3.org/2000/svg" , "path" );
            path.setAttributeNS( null , "d" , this.path );
            var pathLength = path.getTotalLength();
            var pathClosed = ( this.path.toLowerCase().indexOf( 'z' ) != -1 );
            if( this.end == null ){
                this.end = pathLength;
            }
            if( this.center == null ){
                this.center = ( this.end - this.start ) / 2;
            }
            
            var i;
            var point:any;
            var result = [];
            var lastAngle:number = null;
            var angle:number = null;
            var last:any;
            var pathDistance = txt.PathText.DISTANCE;
            if( pathClosed ){ 
                if( this.flipped ){
                    i = this.start;
                    result = [];
                    while( i >= this.end ){
                        if( i > pathLength ){
                            i=0;
                            break;
                        }
                        result.push( path.getPointAtLength( i ) );
                        i = i + pathDistance;
                    }
                    while( i < this.end ){
                        result.push( path.getPointAtLength( i ) );
                        i = i + pathDistance;
                    }
                    return result;
                }else{
                    i = this.end;
                    result = [];
                    while( i >= this.start ){
                        if( i > pathLength ){
                            i=0;
                            break;
                        }
                        result.push( path.getPointAtLength( i ) );
                        i = i + pathDistance;
                    }
                    while( i < this.start ){
                        result.push( path.getPointAtLength( i ) );
                        i = i + pathDistance;
                    }
                    result.reverse();
                    return result;
                }
            }else{ 
                if( this.flipped ){
                    i = this.start;
                    result = [];
                    while( i >= this.end ){
                        if( i > pathLength ){
                            i=0;
                            break;
                        }
                        result.push( path.getPointAtLength( i ) );
                        i = i + pathDistance;
                    }
                    while( i < this.end ){
                        result.push( path.getPointAtLength( i ) );
                        i = i + pathDistance;
                    }
                    return result;
                }else{
                    i = this.start;
                    result = [];
                    while( i <= this.end ){
                        result.push( path.getPointAtLength( i ) );
                        i = i + pathDistance;
                    }
                    return result;
                }
            }
        }
    }
}