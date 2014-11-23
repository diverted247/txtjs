module txt {

    export class Text extends createjs.Container{

        text:string = "";
        lineHeight:number = null;
        width:number = 100;
        height:number = 20;
        align:number = txt.Align.TOP_LEFT;
        characterCase:number = txt.Case.NORMAL;
        size:number = 12;
        font:string = "belinda";
        tracking:number = 0;
        ligatures:boolean = false;
        fillColor:string = "#000";
        strokeColor:string = null;
        strokeWidth:number = null;
        loaderId:number = null;
        style:Style[] = null;
        debug:boolean = false;
        words:Word[] = [];
        lines:Line[] = [];
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
        }

        render(){
            this.getStage().update();
        }

        complete(){}

        fontLoaded( font ){
            this.layout();
        }

        layout(){
            this.text = this.text.replace( /([\n][ \t]+)/g , '\n' );
            this.words = [];
            this.lines = [];
            // TODO - remove composite layout 
            this.removeAllChildren();

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
            
            if( this.text === "" || this.text === undefined ){
                this.render();
                this.complete();
                return;
            }

            if( this.characterLayout() === false ){
                this.removeAllChildren();
                return;
            }
            this.wordLayout();
            this.lineLayout();
            
            this.render();
            this.complete();
        }

        //place characters in words
        characterLayout():boolean {

            //characterlayout adds Charcters to words and measures true height. LineHeight is not a factor til Line layout.

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

            var currentWord:Word = new Word();
            // push a new word to capture characters
            this.words.push( currentWord );

            // loop over characters
            // place into words
            for( var i = 0; i < len; i++ ){
                
                if( this.style !== null && this.style[i] !== undefined ){
                    currentStyle = this.style[i];
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
                if( this.text.charAt( i ) == "\n" ){

                    //only if not last char
                    if( i < len - 1 ){
                        currentWord.measuredWidth = hPosition;
                        currentWord.measuredHeight = vPosition;
                        if( currentWord.measuredHeight == 0 ){
                            currentWord.measuredHeight = currentStyle.size;
                        }
                        currentWord.hasNewLine = true;
                        currentWord = new Word();
                        this.words.push( currentWord );
                        vPosition = 0;
                        hPosition = 0;
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
                
                if( char.measuredHeight > vPosition ){
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
                                i = i+1;
                            }
                        }
                    }
                }
                
                char.x = hPosition;
                
                // push character into word
                currentWord.addChild( char );

                
                // space
                // mark word as having space
                // create new word
                // space character
                if( this.text.charAt( i ) == " " ){

                    currentWord.hasSpace = true;
                    currentWord.spaceOffset = ( char._glyph.offset * char.size );
                    hPosition = char.x + ( char._glyph.offset * char.size ) + char.characterCaseOffset + char.trackingOffset() + char._glyph.getKerning( this.text.charCodeAt( i + 1 ) , char.size );
                    currentWord.measuredWidth = hPosition;
                    currentWord.measuredHeight = vPosition;
                    hPosition = 0;
                    vPosition = 0;
                    currentWord = new Word();
                    this.words.push( currentWord );
                    continue;
                }


                // hyphen
                // mark word as having hyphen
                // create new word
                // space character
                if( this.text.charAt( i ) == "-" ){
                    currentWord.hasHyphen = true;
                }

                hPosition = char.x + ( char._glyph.offset * char.size ) + char.characterCaseOffset + char.trackingOffset() + char._glyph.getKerning( this.text.charCodeAt( i + 1 ) , char.size );

            }
            //case of empty word at end.
            if( currentWord.children.length == 0 ){
                var lw = this.words.pop();
                currentWord = this.words[ this.words.length - 1 ];
                hPosition = currentWord.measuredWidth;
                vPosition = currentWord.measuredHeight;
            }
            currentWord.measuredWidth = hPosition;
            currentWord.measuredHeight = vPosition;

            return true;
        }

        //place words in lines
        wordLayout(){
            // loop over words
            // place into lines
            var len = this.words.length;
            var currentLine = new txt.Line();
            this.lines.push( currentLine );

            currentLine.y = 0;
            
            var currentWord:Word;
            var lastHeight:number;

            this.block.addChild( currentLine );
            var hPosition = 0;
            var vPosition = 0;
            var firstLine = true;

            var lastLineWord: txt.Word;

            for( var i = 0; i < len; i++ ){
                currentWord = this.words[ i ];
                currentWord.x = hPosition;

                if( firstLine ){
                    vPosition = currentWord.measuredHeight;
                }else if( this.lineHeight != null ){
                    vPosition = this.lineHeight;
                }else if( currentWord.measuredHeight > vPosition ){
                    vPosition = currentWord.measuredHeight;
                }

                //exceeds line width && has new line
                if( hPosition + currentWord.measuredWidth > this.width && currentWord.hasNewLine == true ){
                    if( this.lineHeight != null ){
                        lastHeight = currentLine.y + this.lineHeight;
                    }else{
                        lastHeight = currentLine.y + vPosition;
                    }

                    currentLine.measuredWidth = hPosition;
                    lastLineWord = this.words[i - 1];
                    
                    if( lastLineWord != undefined && lastLineWord.hasSpace ){
                        currentLine.measuredWidth -= lastLineWord.spaceOffset;
                    }
                    if( firstLine == false && this.lineHeight != null ){
                        currentLine.measuredHeight = this.lineHeight;
                    }else{
                        currentLine.measuredHeight = vPosition;
                    }
                    
                    
                    firstLine = false;
                    currentLine = new txt.Line();
                    this.lines.push( currentLine );
                    currentLine.y = lastHeight;
                    hPosition = 0;
                    currentWord.x = 0;
                    this.block.addChild( currentLine );
                    //add word
                    var swapWord = this.words[ i ];
                    currentLine.addChild( swapWord );
                    if( this.lineHeight != null ){
                        currentLine.measuredHeight = this.lineHeight;
                    }else{
                        currentLine.measuredHeight = swapWord.measuredHeight;
                    }
                    currentLine.measuredWidth = swapWord.measuredWidth;
                    
                    //add new line
                    currentLine = new txt.Line();
                    this.lines.push( currentLine );
                    if( this.lineHeight != null ){
                        currentLine.y = lastHeight + this.lineHeight;
                    }else{
                        currentLine.y = lastHeight + vPosition;
                    }
                    this.block.addChild( currentLine );
                    if( i < len - 1 ){
                        vPosition = 0;
                    }

                    continue;
                }else

                //wrap word to new line if length
                if( hPosition + currentWord.measuredWidth > this.width && i > 0 && currentLine.children.length > 0 ){
                    if( this.lineHeight != null ){
                        lastHeight = currentLine.y + this.lineHeight;
                    }else{
                        lastHeight = currentLine.y + vPosition;
                    }
                    currentLine.measuredWidth = hPosition;
                    lastLineWord = this.words[i - 1];
                    if( lastLineWord != undefined && lastLineWord.hasSpace ){
                        currentLine.measuredWidth -= lastLineWord.spaceOffset;
                    }
                    if( firstLine == false && this.lineHeight != null ){
                        currentLine.measuredHeight = this.lineHeight;
                    }else{
                        currentLine.measuredHeight = vPosition;
                    }
                    
                    
                    firstLine = false;
                    currentLine = new txt.Line();
                    this.lines.push( currentLine );
                    currentLine.y = lastHeight;
                    if( i < len - 1 ){
                        vPosition = 0;
                    }
                    hPosition = 0;
                    currentWord.x = hPosition;
                    this.block.addChild( currentLine );
                }else

                //wrap word to new line if newline
                if( currentWord.hasNewLine == true ){
                    if( this.lineHeight != null ){
                        lastHeight = currentLine.y + this.lineHeight;
                    }else{
                        lastHeight = currentLine.y + vPosition;
                    }
                    currentLine.measuredWidth = hPosition + currentWord.measuredWidth;
                    if( firstLine == false && this.lineHeight != null ){
                        currentLine.measuredHeight = this.lineHeight;
                    }else{
                        currentLine.measuredHeight = vPosition;
                    }
                    currentLine.addChild( this.words[ i ] );

                    firstLine = false;
                    currentLine = new txt.Line();
                    this.lines.push( currentLine );
                    currentLine.y = lastHeight;
                    if( i < len-1 ){
                        vPosition = 0;
                    }
                    hPosition = 0;
                    
                    this.block.addChild( currentLine );
                    
                    continue;
                }

                hPosition = hPosition + currentWord.measuredWidth;
                currentLine.addChild( this.words[ i ] );
            }

            //case of empty word at end.
            if( currentLine.children.length == 0 ){
                var lw = this.lines.pop();
                currentLine = this.lines[ this.lines.length - 1 ];
            }

            currentLine.measuredWidth = hPosition;
            currentLine.measuredHeight = vPosition;

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
                if( line.lastWord() != undefined && line.lastWord().lastCharacter() ){
                    line.measuredWidth -= line.lastWord().lastCharacter().trackingOffset();
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
                this.block.y = this.lines[ 0 ].measuredHeight * fnt.ascent / fnt.units + this.lines[ 0 ].measuredHeight * fnt.top / fnt.units;

            //MIDDLE ALIGNED
            }else if( this.align === a.MIDDLE_LEFT || this.align === a.MIDDLE_CENTER || this.align === a.MIDDLE_RIGHT  ){
                this.block.y = this.lines[ 0 ].measuredHeight + ( this.height - measuredHeight ) / 2 + this.lines[ 0 ].measuredHeight * fnt.middle / fnt.units ;
            
            //BOTTOM ALIGNED
            }else if( this.align === a.BOTTOM_LEFT || this.align === a.BOTTOM_CENTER || this.align === a.BOTTOM_RIGHT  ){
               this.block.y = this.height - this.lines[ this.lines.length - 1 ].y + this.lines[ 0 ].measuredHeight* fnt.bottom / fnt.units;
            }

        }

    }

}