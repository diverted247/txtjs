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
    }
}