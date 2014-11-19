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
    }

    export interface Point {
        x:number;
        y:number;
    }

}