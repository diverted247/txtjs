module txt {

    export class Glyph{
        path:string = "";
        offset:number;
        kerning:any = {};
        private _graphic:createjs.Graphics = null;
        _fill:createjs.Graphics.Fill;
        _stroke:createjs.Graphics.Stroke;
        _strokeStyle:createjs.Graphics.StrokeStyle;
        
        graphic(){
            if( this._graphic == null ){
                this._graphic = new createjs.Graphics();

                //append fill/stroke/stokeStyle
                //Character instances populate properties before draw
                this._stroke = new createjs.Graphics.Stroke( null , true );
                
                this._strokeStyle = new createjs.Graphics.StrokeStyle( 0 );
                
                this._fill = new createjs.Graphics.Fill( null );
                
                //convert SVG to drawing paths
                this._graphic.decodeSVGPath( this.path );
                
                this._graphic.append( this._fill );
                this._graphic.append( this._strokeStyle );
                this._graphic.append( this._stroke );

            }
            return this._graphic;
        }

        draw( ctx:CanvasRenderingContext2D ):boolean {
            this._graphic.draw( ctx );
            return true;
        }

        getKerning( characterCode:number , size:number ){
            var out = -( this.kerning[ characterCode ] * size );
            if( isNaN( out ) ){
                return 0;
            }
            if( isNaN( characterCode ) ){
                return 0;
            }
            if( isNaN( size ) ){
                return 0;
            }
            if( this.kerning[ characterCode ] != undefined ){
                return out;
            }
            return 0;
        }
        
    }
}