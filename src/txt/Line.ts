module txt {
    
    export class Line extends createjs.Container {
    
        measuredWidth:number;
        measuredHeight:number;
        fontSize:number;
        spacing:number;

        
        constructor(){
            super();

        }

        lastCharacter():txt.Character{
            return <txt.Character>this.children[ this.children.length - 1 ];
        }

    }
}