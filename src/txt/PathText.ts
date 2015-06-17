module txt {

    export enum VerticalAlign { 
        Top,
        CapHeight,
        Center,
        BaseLine,
        Bottom,
        XHeight,
        Ascent,
        Percent
    };

    export class PathText extends createjs.Container {
    
        text:string = "";
        characterCase:number = txt.Case.NORMAL;
        size:number = 12;
        font:string = "belinda";
        tracking:number = 0;
        ligatures:boolean = false;
        minSize:number = null;
        maxTracking:number = null;
        fillColor:string = "#000";
        strokeColor:string = null;
        strokeWidth:number = null;
        style:Style[] = null;
        debug:boolean = false;
        characters:txt.Character[];
        block:createjs.Container;
        original:ConstructObj = null;
        autoExpand:boolean = false;
        autoReduce:boolean = false;
        overset:boolean = false;
        oversetIndex:number = null;
        pathPoints:txt.Path = null;
        path:string = "";
        start:number = 0;
        end:number = null;
        flipped:boolean = false;
        fit:PathFit = txt.PathFit.Rainbow;
        align:PathAlign = txt.PathAlign.Center;
        valign:VerticalAlign = txt.VerticalAlign.BaseLine;
        missingGlyphs:any[] = null;
        renderCycle:boolean = true;
        valignPercent:number = 1;
        initialTracking:number = 0;
        initialOffset:number = 0;
        measured:boolean = false;
        oversetPotential:boolean = false;


        //accessibility
        accessibilityText:string = null;
        accessibilityPriority:number = 2;
        accessibilityId:number = null;
        

        constructor( props:ConstructObj = null ){
            super();

            if( props ){
                this.original = props;
                this.set( props );
                this.original.tracking = this.tracking;
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
            this.pathPoints = new txt.Path( this.path , this.start , this.end , this.flipped , this.fit , this.align );
            //console.log( this );
        }

        complete(){}

        setPath( path:string ){
            this.path = path;
            this.pathPoints.path = this.path;
            this.pathPoints.update();
        }

        setStart( start:number ){
            this.start = start;
            this.pathPoints.start = this.start;
            this.pathPoints.update();
        }

        setEnd( end:number ){
            this.end = end;
            this.pathPoints.end = this.end;
            this.pathPoints.update();
        }

        setFlipped( flipped:boolean ){
            this.flipped = flipped;
            this.pathPoints.flipped = this.flipped;
            this.pathPoints.update();
        }   

        setFit( fit:txt.PathFit = txt.PathFit.Rainbow ){
            this.fit = fit;
            this.pathPoints.fit = this.fit;
            this.pathPoints.update();
        }

        setAlign( align:PathAlign = txt.PathAlign.Center ){
            this.align = align;
            this.pathPoints.align = this.align;
            this.pathPoints.update();
        }

        fontLoaded(){
            this.layout();
        }

        render(){
            this.getStage().update();
        }

        getWidth():number {
            return this.pathPoints.realLength;
        }

        layout(){

            //accessibility api
            txt.Accessibility.set( this );
            this.overset = false;
            this.oversetIndex = null;
            this.removeAllChildren();
            this.characters = [];
            this.missingGlyphs = null;
            this.measured = false;
            this.oversetPotential = false;
            if( this.debug == true ){

                var s = new createjs.Shape();
                s.graphics.beginStroke( "#FF0000" );
                s.graphics.setStrokeStyle( 0.1 );
                s.graphics.decodeSVGPath( this.path );
                s.graphics.endFill();
                s.graphics.endStroke();
                this.addChild( s );

                s = new createjs.Shape();
                var pp = this.pathPoints.getRealPathPoint( 0 );
                s.x = pp.x;
                s.y = pp.y;
                s.graphics.beginFill( "black" );
                s.graphics.drawCircle( 0 , 0 , 2 );
                this.addChild( s );

                s = new createjs.Shape();
                var pp = this.pathPoints.getRealPathPoint( this.pathPoints.start );
                s.x = pp.x;
                s.y = pp.y;
                s.graphics.beginFill( "green" );
                s.graphics.drawCircle( 0 , 0 , 2 );
                this.addChild( s );
                
                s = new createjs.Shape();
                pp = this.pathPoints.getRealPathPoint( this.pathPoints.end );
                s.x = pp.x;
                s.y = pp.y;
                s.graphics.beginFill( "red" );
                s.graphics.drawCircle( 0 , 0 , 2 );
                this.addChild( s );
                
                s = new createjs.Shape();
                pp = this.pathPoints.getRealPathPoint( this.pathPoints.center );
                s.x = pp.x;
                s.y = pp.y;
                s.graphics.beginFill( "blue" );
                s.graphics.drawCircle( 0 , 0 , 2 );
                this.addChild( s );
            }

            if( this.text === "" || this.text === undefined ){
                this.render();
                return;
            }

            this.block = new createjs.Container()
            this.addChild( this.block );

            if( this.autoExpand === true || this.autoReduce === true ){
                if( this.measure() === false ){
                    this.removeAllChildren();
                    return;
                }
            }

            if( this.renderCycle === false ){
                this.removeAllChildren();
                this.complete();
                return;
            }
            
            if( this.characterLayout() === false ){
                this.removeAllChildren();
                return;
            }
            this.render();
            this.complete();
        }

        measure():boolean{
            
            this.measured = true;
            //Extract orgin sizing from this.original to preserve
            //metrics. autoMeasure will change style properties
            //directly. Change this.original to rerender.

            var size = this.original.size;
            var len = this.text.length;
            var width = this.getWidth();
            var defaultStyle = {
                size: this.original.size,
                font: this.original.font,
                tracking: this.original.tracking,
                characterCase: this.original.characterCase
            };
            var currentStyle:any;
            var charCode:number = null;
            var font:txt.Font;
            var charMetrics = [];
            var largestFontSize = defaultStyle.size;
            //console.log( "LOOPCHAR===============" );
            //console.log( " len: " + len );
            for( var i = 0; i < len; i++ ){

                charCode = this.text.charCodeAt(i);

                currentStyle = defaultStyle;
                if( this.original.style !== undefined && this.original.style[ i ] !== undefined ){
                    currentStyle = this.original.style[ i ];
                    // make sure style contains properties needed.
                    if( currentStyle.size === undefined ) currentStyle.size = defaultStyle.size;
                    if( currentStyle.font === undefined ) currentStyle.font = defaultStyle.font;
                    if( currentStyle.tracking === undefined ) currentStyle.tracking = defaultStyle.tracking;
                }
                if( currentStyle.size > largestFontSize ){
                    largestFontSize = currentStyle.size;
                }
                font = txt.FontLoader.fonts[ currentStyle.font ];

                //console.log( currentStyle.tracking , font.units );
                
                charMetrics.push( {
                    char: this.text[ i ],
                    size: currentStyle.size,
                    charCode:charCode,
                    font: currentStyle.font,
                    offset: font.glyphs[ charCode ].offset,
                    units: font.units,
                    tracking: this.trackingOffset( currentStyle.tracking , currentStyle.size , font.units ),
                    kerning: font.glyphs[ charCode ].getKerning( this.getCharCodeAt( i + 1 ) , 1 )
                });
                //console.log( this.text[i] );
            }

            //save space char using last known width/height
            var space:any = {
                char: " ",
                size: currentStyle.size,
                charCode: 32,
                font: currentStyle.font,
                offset: font.glyphs[ 32 ].offset,
                units: font.units,
                tracking: 0,
                kerning: 0
            };

            charMetrics[ charMetrics.length - 1 ].tracking=0;
            //charMetrics[ charMetrics.length-1 ].kerning=0;
            
            len = charMetrics.length;

            //measured without size
            var metricBaseWidth = 0;
            //measured at size
            var metricRealWidth = 0;
            //measured at size with tracking
            var metricRealWidthTracking = 0;

            var current = null;
            //console.log( " len: " + len );
            //console.log( "LOOPMETRICS===============" );
            for( var i = 0; i < len; i++ ){
                current = charMetrics[ i ];
                metricBaseWidth = metricBaseWidth + current.offset + current.kerning;
                metricRealWidth = metricRealWidth + ( ( current.offset + current.kerning ) * current.size );
                metricRealWidthTracking = metricRealWidthTracking + 
                    ( ( current.offset + current.kerning + current.tracking ) * current.size );
                //console.log( current.char );
            }
            //console.log( "METRICS===============" );
            //console.log( "mbw:  " + metricBaseWidth );
            //console.log( "mrw:  " + metricRealWidth );
            //console.log( "mrwt: " + metricRealWidthTracking );
            //console.log( "widt4: " + this.getWidth() );
            //console.log( " len: " + len );
            //console.log( charMetrics );
            //console.log( "======================" );
            
            //size cases
            if( metricRealWidth > width ){
                if( this.autoReduce === true ){
                    this.tracking = 0;
                    this.size = this.original.size * width / ( metricRealWidth + ( space.offset * space.size ) );
                    if( this.minSize != null && this.size < this.minSize ){
                        this.size = this.minSize;
                        if( this.renderCycle === false ){
                            this.overset = true;
                        }else{
                            this.oversetPotential = true;
                        }
                    }
                    //console.log( "REDUCE SIZE")
                    return true;
                }
            //tracking cases
            }else{
                var trackMetric = this.offsetTracking( ( width - metricRealWidth )/( len ) , current.size , current.units );
                if( trackMetric < 0 ){
                    trackMetric = 0;
                }
                //autoexpand case
                if( trackMetric > this.original.tracking && this.autoExpand ){
                    if( this.maxTracking != null && trackMetric > this.maxTracking ){
                        this.tracking = this.maxTracking;
                    }else{
                        this.tracking = trackMetric;
                    }
                    this.size = this.original.size;
                    //console.log( "EXPAND TRACKING")
                    return true;
                }
                //autoreduce tracking case
                if( trackMetric < this.original.tracking && this.autoReduce ){
                    if( this.maxTracking != null && trackMetric > this.maxTracking ){
                        this.tracking = this.maxTracking;
                    }else{
                        this.tracking = trackMetric;
                    }
                    this.size = this.original.size;
                    //console.log( "REDUCE TRACKING")
                    return true;
                }
            }
            return true;
        }

        //place characters in words
        characterLayout():boolean {
            //char layout
            var len = this.text.length;
            var char:Character;
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
            var hPosition:number = 0;
            var charKern:number;
            var tracking:number;
            var angle:number;

            // loop over characters
            // place into lines
            for( var i = 0 ; i < len ; i++ ){
                
                if( this.style !== null && this.style[ i ] !== undefined ){
                    currentStyle = this.style[ i ];
                    // make sure style contains properties needed.
                    if( currentStyle.size === undefined ) currentStyle.size = defaultStyle.size;
                    if( currentStyle.font === undefined ) currentStyle.font = defaultStyle.font;
                    if( currentStyle.tracking === undefined ) currentStyle.tracking = defaultStyle.tracking;
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

                //initalize with initialTracking and initialOffset;
                if( hPosition == 0 ){
                    hPosition = this.initialOffset + this.trackingOffset( this.initialTracking , currentStyle.size , txt.FontLoader.getFont( currentStyle.font ).units );
                }

                // create character
                char = new Character( this.text.charAt( i ) , currentStyle , i );
                if( this.original.character ){
                    if( this.original.character.added ){
                        char.on( 'added' , this.original.character.added );
                    }
                    if( this.original.character.click ){
                        char.on( 'click' , this.original.character.click );
                    }
                    if( this.original.character.dblclick ){
                        char.on( 'dblclick' , this.original.character.dblclick );
                    }
                    if( this.original.character.mousedown ){
                        char.on( 'mousedown' , this.original.character.mousedown );
                    }
                    if( this.original.character.mouseout ){
                        char.on( 'mouseout' , this.original.character.mouseout );
                    }
                    if( this.original.character.mouseover ){
                        char.on( 'mouseover' , this.original.character.mouseover );
                    }
                    if( this.original.character.pressmove ){
                        char.on( 'pressmove' , this.original.character.pressmove );
                    }
                    if( this.original.character.pressup ){
                        char.on( 'pressup' , this.original.character.pressup );
                    }
                    if( this.original.character.removed ){
                        char.on( 'removed' , this.original.character.removed );
                    }
                    if( this.original.character.rollout ){
                        char.on( 'rollout' , this.original.character.rollout );
                    }
                    if( this.original.character.rollover ){
                        char.on( 'rollover' , this.original.character.rollover );
                    }
                    if( this.original.character.tick ){
                        char.on( 'tick' , this.original.character.tick );
                    }
                }
                
                
                if( char.missing ){
                    if( this.missingGlyphs == null ){
                        this.missingGlyphs = [];
                    }
                    this.missingGlyphs.push( { position:i, character:this.text.charAt( i ), font:currentStyle.font } );
                }
                
                //swap character if ligature
                //ligatures removed if tracking or this.ligatures is false
                if( currentStyle.tracking == 0 && this.ligatures == true ){
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

                //char.hPosition = hPosition;

                // push character into block
                //this.characters.push( char );
                //this.block.addChild( char );

                if( this.overset == true ){
                    break;
                }else if( this.measured == true && hPosition + char.measuredWidth > this.getWidth() && this.oversetPotential == true ){
                    //char.hPosition = hPosition;
                    //this.characters.push( char );
                    //this.block.addChild( char );
                    
                    //this.block.removeChild(this.characters.pop() );
                    this.oversetIndex = i;
                    this.overset = true;
                    break;

                }else if( this.measured == false && hPosition + char.measuredWidth > this.getWidth() ){
                    //char.hPosition = hPosition;
                    //this.characters.push( char );
                    //this.block.addChild( char );
                    
                    //this.block.removeChild(this.characters.pop() );
                    this.oversetIndex = i;
                    this.overset = true;
                    break;
                    
                }else{
                    char.hPosition = hPosition;
                    this.characters.push( char );
                    this.block.addChild( char );
                }

                //char.x = hPosition;
                hPosition = hPosition + ( char._glyph.offset * char.size ) + char.characterCaseOffset + char.trackingOffset() + char._glyph.getKerning( this.getCharCodeAt( i + 1 ) , char.size );

            }



            len = this.characters.length;
            var pathPoint:any;
            var nextRotation = false;
            for( i = 0; i < len; i++ ){
                char = <txt.Character>this.characters[ i ];
                //console.log( this.getWidth() );
                pathPoint = this.pathPoints.getPathPoint( char.hPosition , hPosition , char._glyph.offset * char.size );
                //console.log( pathPoint )
                //correct rotation around linesegments
                if( nextRotation == true ){
                    this.characters[ i-1 ].parent.rotation = pathPoint.rotation;
                    nextRotation = false;
                }
                if( pathPoint.next == true ){
                    nextRotation = true;
                }
                
                char.rotation = pathPoint.rotation;
                
                //Baseline
                if( this.valign == txt.VerticalAlign.BaseLine ){
                    char.x = pathPoint.x;
                    char.y = pathPoint.y;

                    //reparent child into offset container
                    if( pathPoint.offsetX ){
                        var offsetChild = new createjs.Container();
                        offsetChild.x = pathPoint.x
                        offsetChild.y = pathPoint.y
                        offsetChild.rotation = pathPoint.rotation;
                        char.parent.removeChild( char );
                        offsetChild.addChild( char );
                        char.x = pathPoint.offsetX;
                        char.y = 0;
                        char.rotation = 0;
                        this.addChild( offsetChild );
                    }else{
                        char.x = pathPoint.x;
                        char.y = pathPoint.y;
                        char.rotation = pathPoint.rotation;
                    
                    }

                }else{
                    var offsetChild = new createjs.Container();
                    offsetChild.x = pathPoint.x
                    offsetChild.y = pathPoint.y
                    offsetChild.rotation = pathPoint.rotation;
                    char.parent.removeChild( char );
                    offsetChild.addChild( char );
                    char.x = 0;
                    
                    //vertical alignment
                    if( this.valign == txt.VerticalAlign.Top ){
                        char.y = char.size;

                    }else if( this.valign == txt.VerticalAlign.Bottom ){
                        char.y = char._font.descent / char._font.units * char.size;

                    }else if( this.valign == txt.VerticalAlign.CapHeight ){
                        char.y = char._font[ 'cap-height' ] / char._font.units * char.size;

                    }else if( this.valign == txt.VerticalAlign.XHeight ){
                        char.y = char._font[ 'x-height' ] / char._font.units * char.size;

                    }else if( this.valign == txt.VerticalAlign.Ascent ){
                        char.y = char._font.ascent / char._font.units * char.size;

                    }else if( this.valign == txt.VerticalAlign.Center ){
                        char.y = char._font[ 'cap-height' ] / char._font.units * char.size / 2;

                    }else if( this.valign == txt.VerticalAlign.Percent ){
                        char.y = this.valignPercent * char.size;

                    }else{
                        char.y = 0;
                    }
                    char.rotation = 0;
                    this.addChild( offsetChild );
                
                }
            }
            
            if( this.original.block ){
                if( this.original.block.added ){
                    this.block.on( 'added' , this.original.block.added );
                }
                if( this.original.block.click ){
                    this.block.on( 'click' , this.original.block.click );
                }
                if( this.original.block.dblclick ){
                    this.block.on( 'dblclick' , this.original.block.dblclick );
                }
                if( this.original.block.mousedown ){
                    this.block.on( 'mousedown' , this.original.block.mousedown );
                }
                if( this.original.block.mouseout ){
                    this.block.on( 'mouseout' , this.original.block.mouseout );
                }
                if( this.original.block.mouseover ){
                    this.block.on( 'mouseover' , this.original.block.mouseover );
                }
                if( this.original.block.pressmove ){
                    this.block.on( 'pressmove' , this.original.block.pressmove );
                }
                if( this.original.block.pressup ){
                    this.block.on( 'pressup' , this.original.block.pressup );
                }
                if( this.original.block.removed ){
                    this.block.on( 'removed' , this.original.block.removed );
                }
                if( this.original.block.rollout ){
                    this.block.on( 'rollout' , this.original.block.rollout );
                }
                if( this.original.block.rollover ){
                    this.block.on( 'rollover' , this.original.block.rollover );
                }
                if( this.original.block.tick ){
                    this.block.on( 'tick' , this.original.block.tick );
                }
            }
            
            return true;

        }

        trackingOffset( tracking:number , size:number , units:number ):number {
            return size * ( 2.5 / units + 1 / 900 + tracking / 990 );
        }

        offsetTracking( offset:number , size:number , units:number ):number {
            return Math.floor( ( offset - 2.5 / units - 1 / 900 ) * 990 / size );
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
    }
}