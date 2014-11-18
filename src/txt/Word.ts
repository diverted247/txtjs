module txt {
    
    export class Word extends createjs.Container {
        
        hasNewLine:boolean = false;
        hasHyphen:boolean = false;
        hasSpace:boolean = false;
        measuredWidth:number;
        measuredHeight:number;
        spaceOffset:number = 0;
        
        constructor(){
            super();
        }

        //txt.CharacterText support
        lastCharacter():txt.Character{
            return <txt.Character>this.children[ this.children.length - 1 ];
        }
    }
}