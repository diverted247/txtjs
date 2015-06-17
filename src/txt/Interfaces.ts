module txt {
    
    export interface Style {
        size:number;
        font:string;
        tracking:number;
        characterCase:number;
        fillColor:string;
        strokeColor:string;
        strokeWidth:number;
    }

    export interface ConstructObj {
        text:string;
        style?:Style[];
        align?:number;
        size?:number;
        height?:number;
        width?:number;
        lineHeight?:number;
        font?:string;
        tracking?:number;
        characterCase?:number;
        fillColor?:string;
        strokeColor?:string;
        strokeWidth?:number;
        debug?:boolean;
        character?:ShapeEvents;
        word?:ShapeEvents;
        line?:ShapeEvents;
        block?:ShapeEvents;
    }
    
    export interface ShapeEvents {
        added?:EventCallback;
        click?:EventCallback;
        dblclick?:EventCallback;
        mousedown?:EventCallback;
        mouseout?:EventCallback;
        mouseover?:EventCallback;
        pressmove?:EventCallback;
        pressup?:EventCallback;
        removed?:EventCallback;
        rollout?:EventCallback;
        rollover?:EventCallback;
        tick?:EventCallback;
    }
    
    export interface WordEvents {
    }
    
    export interface LineEvents {
    }
    
    export interface EventCallback {
        ( value:any ):void;
    }

    export interface Point {
        x:number;
        y:number;
    }

}