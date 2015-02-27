module txt {
    
    export enum PathFit { 
        Rainbow,
        Stairstep
    };

    export interface PathPoint{
        x:number;
        y:number;
        rotation?:number;
        offsetX?:number;
    }

    export enum PathAlign { 
        Center,
        Right,
        Left
    };

    export class Path {
        private pathElement:SVGPathElement = null;
        path:string=null;
        start:number = 0;
        center:number = null;
        end:number = null;
        angles:any[] = null;
        flipped:boolean = false;
        fit:PathFit = txt.PathFit.Rainbow;
        align:PathAlign = txt.PathAlign.Center;
        length:number = null;
        realLength:number = null;
        closed:boolean = false;
        clockwise:boolean = true;

        constructor( path:string, start:number=0, end:number=null, flipped:boolean=false, fit:PathFit=txt.PathFit.Rainbow , align:PathAlign = txt.PathAlign.Center ){
            this.path = path;
            this.start = start;
            this.align = align;
            this.end = end;
            this.flipped = flipped;
            this.fit = fit;
            this.update();
        }

        update(){
            this.pathElement = <SVGPathElement>document.createElementNS( "http://www.w3.org/2000/svg" , "path" );
            this.pathElement.setAttributeNS( null , "d" , this.path );
            this.length = this.pathElement.getTotalLength();
            this.closed = ( this.path.toLowerCase().indexOf( 'z' ) != -1 );
            var pointlength = this.length / 10;
            var points = [];

            //console.log( this.pathElement );
            points.push( this.getRealPathPoint( 0 ) );
            points.push( this.getRealPathPoint( pointlength ) );
            points.push( this.getRealPathPoint( pointlength * 2 ) );
            points.push( this.getRealPathPoint( pointlength * 3 ) );
            points.push( this.getRealPathPoint( pointlength * 4 ) );
            points.push( this.getRealPathPoint( pointlength * 5 ) );
            points.push( this.getRealPathPoint( pointlength * 6 ) );
            points.push( this.getRealPathPoint( pointlength * 7 ) );
            points.push( this.getRealPathPoint( pointlength * 8 ) );
            points.push( this.getRealPathPoint( pointlength * 9 ) );
            points.push( this.getRealPathPoint( pointlength * 10 ) );

            var clock = ( points[1].x - points[0].x ) * ( points[1].y + points[0].y ) + ( points[2].x - points[1].x ) * ( points[2].y + points[1].y ) + ( points[3].x - points[2].x ) * ( points[3].y + points[2].y ) + ( points[4].x - points[3].x ) * ( points[4].y + points[3].y ) + ( points[5].x - points[4].x ) * ( points[5].y + points[4].y ) + ( points[6].x - points[5].x ) * ( points[6].y + points[5].y ) + ( points[7].x - points[6].x ) * ( points[7].y + points[6].y ) + ( points[8].x - points[7].x ) * ( points[8].y + points[7].y ) + ( points[9].x - points[8].x ) * ( points[9].y + points[8].y ) + ( points[10].x - points[9].x ) * ( points[10].y + points[9].y );
            //console.log( clock );
            if( clock > 0 ){
                this.clockwise = false;
            }else{
                this.clockwise = true;
            }

            if( this.end == null ){
                this.end = this.length;
            }
            if( this.closed == false ){
                if( this.flipped == false ){
                    if( this.start > this.end ){
                        this.realLength = this.start - this.end;
                        this.center = this.start - this.realLength/2;
                    }else{
                        this.realLength = this.end - this.start;
                        this.center = this.start + this.realLength/2;
                    }
                }else{
                    if( this.start > this.end ){
                        this.realLength = this.start - this.end;
                        this.center = this.start - this.realLength/2;
                    }else{
                        this.realLength = this.end - this.start;
                        this.center = this.start + this.realLength/2;
                    }
                }

            }else if( this.clockwise == false ){
                if( this.flipped == false ){
                    if( this.start > this.end ){
                        this.realLength = this.start - this.end;
                        this.center = this.end + this.realLength/2;
                    }else{
                        this.realLength = ( this.start + this.length - this.end );
                        this.center = this.end + this.realLength/2;
                        if( this.center > this.length ){
                            this.center = this.center - this.length;
                        }
                    }
                }else{
                    if( this.start > this.end ){
                        this.realLength = ( this.end + this.length - this.start );
                        this.center = this.start + this.realLength/2;
                        if( this.center > this.length ){
                            this.center = this.center - this.length;
                        }
                    }else{
                        this.realLength = this.end - this.start;
                        this.center = this.start + this.realLength/2;
                    }
                }
            }else{
                if( this.flipped == false ){
                    if( this.start > this.end ){
                        this.realLength = this.end + this.length - this.start;
                        this.center = this.start + this.realLength/2;
                        if( this.center > this.length ){
                            this.center = this.center - this.length;
                        }
                    }else{
                        this.realLength = this.end - this.start;
                        this.center = this.start + this.realLength/2;
                    }
                }else{
                    if( this.start > this.end ){
                        this.realLength = this.start - this.end;
                        this.center = this.end + this.realLength/2;
                    }else{
                        this.realLength = this.start + this.length - this.end;
                        this.center = this.end + this.realLength/2;
                        if( this.center > this.length ){
                            this.center = this.center - this.length;
                        }
                    }
                }
            }
        }

        getRealPathPoint( distance:number ):txt.PathPoint {
            if( distance > this.length ){
                return this.pathElement.getPointAtLength( distance - this.length );
            }else if( distance < 0 ){
                return this.pathElement.getPointAtLength( distance + this.length );
            }else{
                return this.pathElement.getPointAtLength( distance );
            }
        }

        getPathPoint( distance:number , characterLength:number = 0 , charOffset:number = 0 ):txt.PathPoint {
            distance = distance * 0.99;
            characterLength = characterLength * 0.99;

            //console.log( characterLength );
            var point0:PathPoint;
            var point1:PathPoint;
            var point2:PathPoint;
            var position:number;
            var direction:boolean = true;
            var realStart:number = 0;

            if( this.closed == false ){

                if( this.flipped == false ){

                    if( this.start > this.end ){

                        if( this.align == PathAlign.Left ){
                            realStart = this.start;
                        
                        }else if( this.align == PathAlign.Center ){
                            realStart = this.start - ( this.realLength - characterLength )/2;
                        
                        }else if( this.align == PathAlign.Right ){
                            realStart = this.start - this.realLength - characterLength;
                        }
                        position = realStart - distance;
                        direction = false;

                        
                    }else{
                        if( this.align == PathAlign.Left ){
                            realStart = this.start;
                        
                        }else if( this.align == PathAlign.Center ){
                            realStart = this.start + ( this.realLength - characterLength )/2;
                        
                        }else if( this.align == PathAlign.Right ){
                            realStart = this.start + this.realLength - characterLength;
                        }
                        position = realStart + distance;

                    }
                }else{
                    if( this.start > this.end ){
                        if( this.align == PathAlign.Left ){
                            realStart = this.start;
                        
                        }else if( this.align == PathAlign.Center ){
                            realStart = this.start - ( this.realLength - characterLength )/2;
                        
                        }else if( this.align == PathAlign.Right ){
                            realStart = this.start - this.realLength - characterLength;
                        }
                        position = realStart - distance;
                        direction = false;

                    }else{
                        if( this.align == PathAlign.Left ){
                            realStart = this.start;
                        
                        }else if( this.align == PathAlign.Center ){
                            realStart = this.start + ( this.realLength - characterLength )/2;
                        
                        }else if( this.align == PathAlign.Right ){
                            realStart = this.start + this.realLength - characterLength;
                        }
                        position = realStart - distance;
                        
                    }
                }

            }else if( this.clockwise == false ){

                if( this.flipped == false ){
                
                    if( this.start > this.end ){

                        if( this.align == PathAlign.Left ){
                            realStart = this.start;
                        
                        }else if( this.align == PathAlign.Center ){
                            realStart = this.start - ( this.realLength - characterLength )/2;
                        
                        }else if( this.align == PathAlign.Right ){
                            realStart = this.start - this.realLength - characterLength;
                        }

                        position = realStart - distance;
                        direction = false;
                        
                    }else{

                       if( this.align == PathAlign.Left ){
                            realStart = this.start;
                            position = realStart - distance;
                        
                        }else if( this.align == PathAlign.Center ){
                            realStart = this.start - ( this.realLength - characterLength )/2;
                            position = realStart - distance;
                        
                        }else if( this.align == PathAlign.Right ){
                            realStart = this.start - this.realLength - characterLength;
                            position = realStart - distance;
                        }

                        if( position < 0 ){
                            position = position + this.length;
                        }
                        direction = false;


                    }

                }else{

                    if( this.start > this.end ){
                        
                        if( this.align == PathAlign.Left ){
                            realStart = this.start;
                            position = realStart + distance;
                        
                        }else if( this.align == PathAlign.Center ){
                            realStart = this.start + ( this.realLength - characterLength )/2;
                            position = realStart + distance;
                        
                        }else if( this.align == PathAlign.Right ){
                            realStart = this.start + this.realLength - characterLength;
                            position = realStart + distance;
                            
                        }

                        if( position > this.length ){
                            position = position - this.length;
                        }


                    }else{

                        if( this.align == PathAlign.Left ){
                            realStart = this.start;
                        
                        }else if( this.align == PathAlign.Center ){
                            realStart = this.start + ( this.realLength - characterLength )/2;
                        
                        }else if( this.align == PathAlign.Right ){
                            realStart = this.start + this.realLength - characterLength;
                        }
                        position = realStart + distance;

                    }

                }
            }else{
                if( this.flipped == false ){

                    if( this.start > this.end ){

                        if( this.align == PathAlign.Left ){
                            realStart = this.start;
                            position = realStart - distance;
                        
                        }else if( this.align == PathAlign.Center ){
                            realStart = this.start - ( this.realLength - characterLength )/2;
                            position = realStart - distance;
                        
                        }else if( this.align == PathAlign.Right ){
                            realStart = this.start - this.realLength - characterLength;
                            position = realStart - distance;
                        }

                        if( position < 0 ){
                            position = position + this.length;
                        }
                        direction = false;

                    }else{

                        if( this.align == PathAlign.Left ){
                            realStart = this.start;
                        
                        }else if( this.align == PathAlign.Center ){
                            realStart = this.start - ( this.realLength - characterLength )/2;
                        
                        }else if( this.align == PathAlign.Right ){
                            realStart = this.start - this.realLength - characterLength;
                        }
                        position = realStart - distance;
                        direction = false;

                    }

                }else{

                    if( this.start > this.end ){

                        if( this.align == PathAlign.Left ){
                            realStart = this.start;
                        
                        }else if( this.align == PathAlign.Center ){
                            realStart = this.start + ( this.realLength - characterLength )/2;
                        
                        }else if( this.align == PathAlign.Right ){
                            realStart = this.start + this.realLength - characterLength;
                        }
                        position = realStart + distance;

                    }else{

                        if( this.align == PathAlign.Left ){
                            realStart = this.start;
                            position = realStart + distance;
                        
                        }else if( this.align == PathAlign.Center ){
                            realStart = this.start + ( this.realLength - characterLength )/2;
                            position = realStart + distance;
                        
                        }else if( this.align == PathAlign.Right ){
                            realStart = this.start + this.realLength - characterLength;
                            position = realStart + distance;
                            
                        }

                        if( position > this.length ){
                            position = position - this.length;
                        }

                    }
                }
            }

            
            point1 = this.getRealPathPoint( position );
            var segment = this.pathElement.pathSegList.getItem( this.pathElement.getPathSegAtLength( position ) ).pathSegType;

            if( segment == 4 ){
                if( direction ){
                    
                }else{
                    if( this.pathElement.getPathSegAtLength( position ) != this.pathElement.getPathSegAtLength( position - charOffset ) ){
                        
                        var pp0 = this.getRealPathPoint( position );
                        var pp1 = this.getRealPathPoint( position - charOffset );
                        var ppc = this.pathElement.pathSegList.getItem( this.pathElement.getPathSegAtLength( position ) - 1 );
                        var d0 = Math.sqrt( Math.pow( ( pp0.x - ppc['x'] ) , 2 ) + Math.pow( ( pp0.y - ppc['y'] ) , 2 ) );

                        var d1 = Math.sqrt( Math.pow( ( pp1.x - ppc['x'] ) , 2 ) + Math.pow( ( pp1.y - ppc['y'] ) , 2 ) );

                        if( d0 > d1 ){
                            point1 = pp0;
                            point2 = { x:ppc['x'], y:ppc['y'] };

                            var rot12 = Math.atan( ( point2.y - point1.y ) / ( point2.x - point1.x ) ) * 180 / Math.PI;
                            if( point1.x > point2.x ){
                                rot12 = rot12 + 180;
                            }
                            
                            if( rot12 < 0 ){
                                rot12 = rot12 + 360;
                            }
                            if( rot12 > 360 ){
                                rot12 = rot12 - 360;
                            }

                            point1.rotation = rot12;
                            return point1;

                        }else{
                            point1 = { x:ppc['x'], y:ppc['y'] };
                            point1.offsetX = -d0;
                            point1['next'] = true;
                            return point1;
                        }
                    }
                }
            }

            if( direction ){
                point2 = this.getRealPathPoint( position + charOffset );
            }else{
                point2 = this.getRealPathPoint( position - charOffset );
            }

            var rot12 = Math.atan( ( point2.y - point1.y ) / ( point2.x - point1.x ) ) * 180 / Math.PI;
            
            
            if( point1.x > point2.x ){
                rot12 = rot12 + 180;
            }

            
            if( rot12 < 0 ){
                rot12 = rot12 + 360;
            }
            if( rot12 > 360 ){
                rot12 = rot12 - 360;
            }

            point1.rotation = rot12;
            return point1;
        }
    }

}