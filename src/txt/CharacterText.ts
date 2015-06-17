module txt {

    export class CharacterText extends createjs.Container{

        text:string = "";
        lineHeight:number = null;
        width:number = 100;
        height:number = 20;
        align:number = txt.Align.TOP_LEFT;
        characterCase:number = txt.Case.NORMAL;
        size:number = 12;
        minSize:number = null;
        maxTracking:number = null;
        font:string = "belinda";
        tracking:number = 0;
        ligatures:boolean = false;
        fillColor:string = "#000";
        strokeColor:string = null;
        strokeWidth:number = null;
        singleLine:boolean = false;
        autoExpand:boolean = false;
        autoReduce:boolean = false;
        overset:boolean = false;
        oversetIndex:number = null;
        loaderId:number = null;
        style:Style[] = null;
        debug:boolean = false;
        original:ConstructObj = null;
        lines:Line[] = [];
        block:createjs.Container;
        missingGlyphs:any[] = null;
        renderCycle:boolean = true;
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
        }

        //called when text is rendered
        complete(){}

        //called when font has loaded
        fontLoaded(){
            this.layout();
        }

        //call stage.update to render canvas
        //overload to support deferred rendering
        render(){
            this.getStage().update();
        }

        
        //layout text
        layout(){
            
            //accessibility api
            txt.Accessibility.set( this );

            this.overset = false;
            this.measured = false;
            this.oversetPotential = false;

            if( this.original.size ){
                this.size = this.original.size;
            }
            if( this.original.tracking ){
                this.tracking = this.original.tracking;
            }
            this.text = this.text.replace( /([\n][ \t]+)/g , '\n' );

            if( this.singleLine === true ){
                this.text = this.text.split( '\n' ).join( '' );
                this.text = this.text.split( '\r' ).join( '' );
            }
            
            this.lines = [];
            this.missingGlyphs = null;
            this.removeAllChildren();

            if( this.text === "" || this.text === undefined ){
                this.render();
                this.complete();
                return;
            }

            this.block = new createjs.Container()
            this.addChild( this.block );

            //debug
            //draw baseline, ascent, ascender, descender lines 
            if( this.debug == true ){

                var font:txt.Font = txt.FontLoader.getFont( this.font );
                //outline
                var s = new createjs.Shape();
                s.graphics.beginStroke( "#FF0000" );
                s.graphics.setStrokeStyle( 1.2 );
                s.graphics.drawRect( 0 , 0 , this.width , this.height );
                this.addChild( s );

                //baseline
                s = new createjs.Shape();
                s.graphics.beginFill( "#000" );
                s.graphics.drawRect( 0 , 0 , this.width , 0.2 );
                s.x = 0;
                s.y = 0;
                this.block.addChild( s );

                s = new createjs.Shape();
                s.graphics.beginFill( "#F00" );
                s.graphics.drawRect( 0 , 0 , this.width , 0.2 );
                s.x = 0;
                s.y = -font[ 'cap-height' ] / font.units * this.size;
                this.block.addChild( s );

                s = new createjs.Shape();
                s.graphics.beginFill( "#0F0" );
                s.graphics.drawRect( 0 , 0 , this.width , 0.2 );
                s.x = 0;
                s.y = -font.ascent / font.units * this.size;
                this.block.addChild( s );

                s = new createjs.Shape();
                s.graphics.beginFill( "#00F" );
                s.graphics.drawRect( 0 , 0 , this.width , 0.2 );
                s.x = 0;
                s.y = -font.descent / font.units * this.size;
                this.block.addChild( s );
            
            }
            if( this.singleLine === true && ( this.autoExpand === true || this.autoReduce === true ) ){
                this.measure();
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
            this.lineLayout();
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
                    char: this.text[i],
                    size: currentStyle.size,
                    charCode:charCode,
                    font: currentStyle.font,
                    offset: font.glyphs[charCode].offset,
                    units: font.units,
                    tracking: this.trackingOffset( currentStyle.tracking , currentStyle.size , font.units ),
                    kerning: font.glyphs[charCode].getKerning( this.getCharCodeAt( i + 1 ) , 1 )
                } );
                //console.log( this.text[i] );
            }

            //save space char using last known width/height
            var space:any = {
                char: " ",
                size: currentStyle.size,
                charCode: 32,
                font: currentStyle.font,
                offset: font.glyphs[32].offset,
                units: font.units,
                tracking: 0,
                kerning: 0
            };

            charMetrics[ charMetrics.length-1 ].tracking=0;
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
            
            //size cases
            if( metricRealWidth > this.width ){
                if( this.autoReduce === true ){
                    this.tracking = 0;
                    this.size = this.original.size * this.width / ( metricRealWidth + ( space.offset * space.size ) );
                    if( this.minSize != null && this.size < this.minSize ){
                        this.size = this.minSize;
                        this.oversetPotential = true;
                    }
                    //console.log( "REDUCE SIZE")
                    return true;
                }
            //tracking cases
            }else{
                var trackMetric = this.offsetTracking( ( this.width - metricRealWidth )/( len ) , current.size , current.units );
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

        trackingOffset( tracking:number , size:number , units:number ):number {
            return size * ( 2.5 / units + 1 / 900 + tracking / 990 );
        }

        offsetTracking( offset:number , size:number , units:number ):number {
            return Math.floor( ( offset - 2.5 / units - 1 / 900 ) * 990 / size );
        }

        getWidth():number {
            return this.width;
        }

        //place characters in lines
        characterLayout():boolean {

            //characterlayout adds Charcters to lines. LineHeight IS a factor given lack of Words.

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
            var vPosition:number = 0;
            var charKern:number;
            var tracking:number;
            var lineY:number = 0;
            var firstLine = true;

            var currentLine:Line = new Line();
            
            this.lines.push( currentLine );
            this.block.addChild( currentLine );

            // loop over characters
            // place into lines
            for( var i = 0; i < len; i++ ){
                
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
                // mark word as having newline
                // create new word
                // new line has no character
                if( this.text.charAt( i ) == "\n" || this.text.charAt( i ) == "\r" ){

                    //only if not last char
                    if( i < len - 1 ){
                        if( firstLine === true ){
                            vPosition = currentStyle.size;
                            currentLine.measuredHeight = currentStyle.size;
                            currentLine.measuredWidth = hPosition;
                            lineY = 0;
                            currentLine.y = 0;
                        }else if( this.lineHeight != undefined ){
                            vPosition = this.lineHeight;
                            currentLine.measuredHeight = vPosition;
                            currentLine.measuredWidth = hPosition;
                            lineY = lineY + vPosition;
                            currentLine.y = lineY;
                        }else{
                            vPosition = char.measuredHeight;
                            currentLine.measuredHeight = vPosition;
                            currentLine.measuredWidth = hPosition;
                            lineY = lineY + vPosition;
                            currentLine.y = lineY;
                        }

                        firstLine = false;
                        currentLine = new Line();
                        currentLine.measuredHeight = currentStyle.size;
                        currentLine.measuredWidth = 0;
                        this.lines.push( currentLine );
                        this.block.addChild( currentLine );
                        vPosition = 0;
                        hPosition = 0;
                    }

                    if( this.text.charAt( i ) == "\r" && this.text.charAt( i + 1 ) == "\n" ){
                        i++;
                    }
                    
                    continue;
                }

                //runtime test for font
                if( txt.FontLoader.isLoaded( currentStyle.font ) === false ){
                    txt.FontLoader.load( this , [ currentStyle.font ] );
                    return false;
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

                if( firstLine === true ){
                    
                    if( vPosition < char.size ){
                        vPosition = char.size;
                    }

                }else if( this.lineHeight != undefined && this.lineHeight > 0 ){
                    if( vPosition < this.lineHeight ){
                        vPosition = this.lineHeight;
                    }
                }else if( char.measuredHeight > vPosition ){
                    vPosition = char.measuredHeight;
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
                                i = i + 1;
                            }
                        }
                    }
                }

                if( this.overset == true ){
                    break;
                }else if( this.singleLine === false && hPosition + char.measuredWidth > this.width  ){
                    var lastchar:Character = <txt.Character>currentLine.children[ currentLine.children.length - 1 ];
                    if( lastchar.characterCode == 32 ){
                        currentLine.measuredWidth = hPosition - lastchar.measuredWidth - lastchar.trackingOffset() - lastchar._glyph.getKerning( this.getCharCodeAt( i ) , lastchar.size );
                    }else{
                        currentLine.measuredWidth = hPosition - lastchar.trackingOffset() - lastchar._glyph.getKerning( this.getCharCodeAt( i ) , lastchar.size );
                    }
                    if( firstLine === true ){
                        currentLine.measuredHeight = vPosition;
                        currentLine.y = 0;
                        lineY = 0;
                    }else{
                        currentLine.measuredHeight = vPosition;
                        lineY = lineY + vPosition;
                        currentLine.y = lineY;
                    }
                    firstLine = false;
                    currentLine = new Line();
                    currentLine.addChild( char );

                    if( char.characterCode == 32 ){
                        hPosition = 0;
                    }else{
                        hPosition = char.x + ( char._glyph.offset * char.size ) + char.characterCaseOffset + char.trackingOffset();
                    }
                    
                    this.lines.push( currentLine );
                    this.block.addChild( currentLine );
                    vPosition = 0;

                //measured case
                }else if( this.measured == true && this.singleLine === true && hPosition + char.measuredWidth > this.width && this.oversetPotential == true ){
                    
                    //char.x = hPosition;
                    //currentLine.addChild( char );
                    this.oversetIndex = i;
                    this.overset = true;
                    //hPosition = char.x + ( char._glyph.offset * char.size ) + char.characterCaseOffset + char.trackingOffset() + char._glyph.getKerning( this.getCharCodeAt( i + 1 ) , char.size );
                    
                //not measured
                }else if( this.measured == false && this.singleLine === true && hPosition + char.measuredWidth > this.width  ){
                    //char.x = hPosition;
                    //currentLine.addChild( char );
                    this.oversetIndex = i;
                    this.overset = true;
                    //hPosition = char.x + ( char._glyph.offset * char.size ) + char.characterCaseOffset + char.trackingOffset() + char._glyph.getKerning( this.getCharCodeAt( i + 1 ) , char.size );
                    
                }else{
                    char.x = hPosition;
                    // push character into word
                    currentLine.addChild( char );
                    hPosition = char.x + ( char._glyph.offset * char.size ) + char.characterCaseOffset + char.trackingOffset() + char._glyph.getKerning( this.getCharCodeAt( i + 1 ) , char.size );
                }

            }
            //case of empty word at end.
            if( currentLine.children.length == 0 ){
                var lw = this.lines.pop();
                currentLine = this.lines[ this.lines.length - 1 ];
                hPosition = currentLine.measuredWidth;
                vPosition = currentLine.measuredHeight;
                
            }
            if( firstLine === true ){
                currentLine.measuredWidth = hPosition;
                currentLine.measuredHeight = vPosition;
                currentLine.y = 0;
            }else{
                currentLine.measuredWidth = hPosition;
                currentLine.measuredHeight = vPosition;
                if( vPosition == 0 ){
                    if( this.lineHeight ){
                        vPosition = this.lineHeight;
                    }else{
                        vPosition = currentStyle.size;
                    }
                }
                currentLine.y = lineY + vPosition;
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
                return this.text.charAt( index ).charCodeAt( 0 );
            }
        }

        
        lineLayout(){
            // loop over lines
            // place into text
            var blockHeight = 0;
            var measuredWidth = 0;
            var measuredHeight = 0;
            var line;
            var a = txt.Align;
            var fnt:txt.Font = txt.FontLoader.getFont( this.font );
            var aHeight = this.size * fnt.ascent / fnt.units;
            var cHeight = this.size * fnt[ 'cap-height' ] / fnt.units;
            var xHeight = this.size * fnt[ 'x-height' ] / fnt.units;
            var dHeight = this.size * fnt.descent / fnt.units;
                
            var len = this.lines.length;
            for( var i = 0; i < len; i++ ){

                line = this.lines[ i ];
                
                //correct measuredWidth if last line character contains tracking
                if( line.lastCharacter() ){
                    line.measuredWidth -= line.lastCharacter().trackingOffset();
                }
                
                if( this.original.line ){
                    if( this.original.line.added ){
                        line.on( 'added' , this.original.line.added );
                    }
                    if( this.original.line.click ){
                        line.on( 'click' , this.original.line.click );
                    }
                    if( this.original.line.dblclick ){
                        line.on( 'dblclick' , this.original.line.dblclick );
                    }
                    if( this.original.line.mousedown ){
                        line.on( 'mousedown' , this.original.line.mousedown );
                    }
                    if( this.original.line.mouseout ){
                        line.on( 'mouseout' , this.original.line.mouseout );
                    }
                    if( this.original.line.mouseover ){
                        line.on( 'mouseover' , this.original.line.mouseover );
                    }
                    if( this.original.line.pressmove ){
                        line.on( 'pressmove' , this.original.line.pressmove );
                    }
                    if( this.original.line.pressup ){
                        line.on( 'pressup' , this.original.line.pressup );
                    }
                    if( this.original.line.removed ){
                        line.on( 'removed' , this.original.line.removed );
                    }
                    if( this.original.line.rollout ){
                        line.on( 'rollout' , this.original.line.rollout );
                    }
                    if( this.original.line.rollover ){
                        line.on( 'rollover' , this.original.line.rollover );
                    }
                    if( this.original.line.tick ){
                        line.on( 'tick' , this.original.line.tick );
                    }
                }

                measuredHeight += line.measuredHeight;
                
                if( this.align === a.TOP_CENTER ){
                    //move to center
                    line.x = ( this.width - line.measuredWidth ) / 2;
                }else if( this.align === a.TOP_RIGHT ){
                    //move to right
                    line.x = ( this.width - line.measuredWidth );
                }else if( this.align === a.MIDDLE_CENTER ){
                    //move to center
                    line.x = ( this.width - line.measuredWidth ) / 2;
                }else if( this.align === a.MIDDLE_RIGHT ){
                    //move to right
                    line.x = ( this.width - line.measuredWidth );
                }else if( this.align === a.BOTTOM_CENTER ){
                    //move to center
                    line.x = ( this.width - line.measuredWidth ) / 2;
                }else if( this.align === a.BOTTOM_RIGHT ){
                    //move to right
                    line.x = ( this.width - line.measuredWidth );
                }
            }

            //TOP ALIGNED
            if( this.align === a.TOP_LEFT || this.align === a.TOP_CENTER || this.align === a.TOP_RIGHT  ){
                if( fnt.top == 0 ){
                    this.block.y = this.lines[ 0 ].measuredHeight * fnt.ascent / fnt.units;
                }else{
                    this.block.y = this.lines[ 0 ].measuredHeight * fnt.ascent / fnt.units + this.lines[ 0 ].measuredHeight * fnt.top / fnt.units;
                }

            //MIDDLE ALIGNED
            }else if( this.align === a.MIDDLE_LEFT || this.align === a.MIDDLE_CENTER || this.align === a.MIDDLE_RIGHT  ){
                this.block.y = this.lines[ 0 ].measuredHeight + ( this.height - measuredHeight ) / 2 + this.lines[ 0 ].measuredHeight * fnt.middle / fnt.units ;
            
            //BOTTOM ALIGNED
            }else if( this.align === a.BOTTOM_LEFT || this.align === a.BOTTOM_CENTER || this.align === a.BOTTOM_RIGHT  ){
               this.block.y = this.height - this.lines[ this.lines.length - 1 ].y + this.lines[ 0 ].measuredHeight* fnt.bottom / fnt.units;
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
        }

    }

}