module txt {
    
    export class Line extends createjs.Container {
    
        measuredWidth:number;
        measuredHeight:number;
        
        constructor(){
            super();

        }

        //txt.Text support
        lastWord():txt.Word{
            return <txt.Word>this.children[ this.children.length - 1 ];
        }

        //txt.CharacterText support
        lastCharacter():txt.Character{
            return <txt.Character>this.children[ this.children.length - 1 ];
        }

    }
}