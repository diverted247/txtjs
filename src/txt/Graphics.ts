createjs.Graphics.prototype.decodeSVGPath = function( data:string ){
    txt.Graphics.init( this , data );
    return this;
}

module txt {

    export class Graphics{

        static init( target , svgpath:string ){

            var ca = Graphics.parsePathData( svgpath );
            var G = createjs.Graphics;
            var closedPath = false;
            
            for( var n = 0; n < ca.length; n++ ){
                var c = ca[ n ].command;
                var p = ca[ n ].points;
                switch ( c ){

                    case 'L':
                        target.append( new G.LineTo( p[ 0 ] , p[ 1 ] ) );
                        break;

                    case 'M':
                        target.append( new G.MoveTo( p[ 0 ] , p[ 1 ] ) );
                        break;

                    case 'C':
                        target.append( new G.BezierCurveTo( p[ 0 ] , p[ 1 ] , p[ 2 ] , p[ 3 ] , p[ 4 ] , p[ 5 ] ) );
                        break;

                    case 'Q':
                        target.append( new G.QuadraticCurveTo( p[ 0 ] , p[ 1 ] , p[ 2 ] , p[ 3 ] ) );
                        break;

                    case 'A':
                        target.append( new G.SVGArc( p[ 0 ] , p[ 1 ] , p[ 2 ] , p[ 3 ] , p[ 4 ] , p[ 5 ] , p[ 6 ] ) );
                        break;

                    case 'Z':
                        target.append( new G.ClosePath() );
                        target.append( new G.MoveTo( p[ 0 ] , p[ 1 ] ) );
                        break;
                }

            }
        }

        static parsePathData( data ) {
            if( !data ) {
                return [];
            }
            var cs = data;
            var cc = [ 'm' , 'M' , 'l' , 'L' , 'v' , 'V' , 'h' , 'H' , 'z' , 'Z' , 'c' , 'C' , 'q' , 'Q' , 't' , 'T' , 's' , 'S' , 'a' , 'A' ];
            cs = cs.replace( new RegExp( ' ' , 'g' ) , ',' );
            for( var n = 0 ; n < cc.length ; n++ ){
                cs = cs.replace( new RegExp( cc[ n ] , 'g' ) , '|' + cc[ n ] );
            }
            var arr = cs.split( '|' );
            var ca = [];
            var cpx = 0;
            var cpy = 0;
            var arrLength = arr.length;
            var startPoint = null;
            for( n = 1 ; n < arrLength ; n++ ) {
                var str = arr[ n ];
                var c = str.charAt( 0 );
                str = str.slice( 1 );
                str = str.replace( new RegExp( ',-' , 'g' ) , '-' );
                str = str.replace( new RegExp( '-' , 'g' ) , ',-' );
                str = str.replace( new RegExp( 'e,-' , 'g' ) , 'e-' );
                var p = str.split( ',' );
                if( p.length > 0 && p[0] === '' ){
                    p.shift();
                }
                var pLength = p.length;
                for( var i = 0; i < pLength; i++ ){
                    p[ i ] = parseFloat( p[ i ] );
                }
                if( c === 'z' || c === 'Z' ){
                    p = [ true ]
                }
                
                while( p.length > 0 ){
                    if( isNaN( p[ 0 ] ) ){
                        break;
                    }
                    var cmd = null;
                    var points = [];
                    var startX = cpx, startY = cpy;
                    var prevCmd, ctlPtx, ctlPty;
                    var rx, ry, psi, fa, fs, x1, y1;
                    
                    switch( c ){

                        case 'l':
                            cpx += p.shift();
                            cpy += p.shift();
                            cmd = 'L';
                            points.push( cpx , cpy );
                            break;

                        case 'L':
                            cpx = p.shift();
                            cpy = p.shift();
                            points.push( cpx , cpy );
                            break;

                        case 'm':
                            var dx = p.shift();
                            var dy = p.shift();
                            cpx += dx;
                            cpy += dy;
                            if( startPoint == null ){
                                startPoint = [ cpx , cpy ];
                            }
                            cmd = 'M';
                            points.push( cpx , cpy );
                            c = 'l';
                            break;

                        case 'M':
                            cpx = p.shift();
                            cpy = p.shift();
                            cmd = 'M';
                            if( startPoint == null ){
                                startPoint = [ cpx , cpy ];
                            }
                            points.push( cpx , cpy );
                            c = 'L';
                            break;

                        case 'h':
                            cpx += p.shift();
                            cmd = 'L';
                            points.push( cpx , cpy );
                            break;

                        case 'H':
                            cpx = p.shift();
                            cmd = 'L';
                            points.push( cpx , cpy );
                            break;

                        case 'v':
                            cpy += p.shift();
                            cmd = 'L';
                            points.push( cpx , cpy );
                            break;

                        case 'V':
                            cpy = p.shift();
                            cmd = 'L';
                            points.push( cpx , cpy );
                            break;

                        case 'C':
                            points.push( p.shift() , p.shift() , p.shift() , p.shift() );
                            cpx = p.shift();
                            cpy = p.shift();
                            points.push( cpx , cpy );
                            break;

                        case 'c':
                            points.push( cpx + p.shift() , cpy + p.shift() , cpx + p.shift() , cpy + p.shift() );
                            cpx += p.shift();
                            cpy += p.shift();
                            cmd = 'C';
                            points.push( cpx , cpy );
                            break;

                        case 'S':
                            ctlPtx = cpx;
                            ctlPty = cpy;
                            prevCmd = ca[ ca.length - 1 ];
                            if( prevCmd.command === 'C' ){
                                ctlPtx = cpx + ( cpx - prevCmd.points[ 2 ] );
                                ctlPty = cpy + ( cpy - prevCmd.points[ 3 ] );
                            }
                            points.push( ctlPtx , ctlPty , p.shift() , p.shift() );
                            cpx = p.shift();
                            cpy = p.shift();
                            cmd = 'C';
                            points.push( cpx , cpy );
                            break;

                        case 's':
                            ctlPtx = cpx;
                            ctlPty = cpy;
                            prevCmd = ca[ ca.length - 1 ];
                            if( prevCmd.command === 'C' ){
                                ctlPtx = cpx + ( cpx - prevCmd.points[ 2 ] );
                                ctlPty = cpy + ( cpy - prevCmd.points[ 3 ] );
                            }
                            points.push( ctlPtx , ctlPty , cpx + p.shift() , cpy + p.shift() );
                            cpx += p.shift();
                            cpy += p.shift();
                            cmd = 'C';
                            points.push( cpx , cpy );
                            break;

                        case 'Q':
                            points.push( p.shift() , p.shift() );
                            cpx = p.shift();
                            cpy = p.shift();
                            points.push( cpx , cpy );
                            break;

                        case 'q':
                            points.push( cpx + p.shift() , cpy + p.shift() );
                            cpx += p.shift();
                            cpy += p.shift();
                            cmd = 'Q';
                            points.push( cpx , cpy );
                            break;

                        case 'T':
                            ctlPtx = cpx;
                            ctlPty = cpy;
                            prevCmd = ca[ ca.length - 1 ];
                            if( prevCmd.command === 'Q' ){
                                ctlPtx = cpx + ( cpx - prevCmd.points[ 0 ] );
                                ctlPty = cpy + ( cpy - prevCmd.points[ 1 ] );
                            }
                            cpx = p.shift();
                            cpy = p.shift();
                            cmd = 'Q';
                            points.push( ctlPtx , ctlPty , cpx , cpy );
                            break;

                        case 't':
                            ctlPtx = cpx;
                            ctlPty = cpy;
                            prevCmd = ca[ ca.length - 1 ];
                            if( prevCmd.command === 'Q' ){
                                ctlPtx = cpx + ( cpx - prevCmd.points[ 0 ] );
                                ctlPty = cpy + ( cpy - prevCmd.points[ 1 ] );
                            }
                            cpx += p.shift();
                            cpy += p.shift();
                            cmd = 'Q';
                            points.push( ctlPtx , ctlPty , cpx , cpy );
                            break;

                        case 'A':
                            rx = p.shift();
                            ry = p.shift();
                            psi = p.shift();
                            fa = p.shift();
                            fs = p.shift();
                            x1 = cpx;
                            y1 = cpy;
                            cpx = p.shift();
                            cpy = p.shift();
                            cmd = 'A';
                            points = [ [ x1 , y1 ] , rx , ry , psi , fa , fs , [ cpx , cpy ] ];
                            break;

                        case 'a':
                            rx = p.shift();
                            ry = p.shift();
                            psi = p.shift();
                            fa = p.shift();
                            fs = p.shift();
                            x1 = cpx;
                            y1 = cpy;
                            cpx += p.shift();
                            cpy += p.shift();
                            cmd = 'A';
                            points = [ [ x1 , y1 ] , rx , ry , psi , fa , fs , [ cpx , cpy ] ];
                            break;

                        case 'z':
                            cmd = 'Z';
                            if( startPoint ){
                                cpx = startPoint[ 0 ];
                                cpy = startPoint[ 1 ];
                                startPoint = null;
                            }else{
                                cpx = 0;
                                cpy = 0;
                            }
                            p.shift();
                            points = [ cpx , cpy ];
                            break;

                        case 'Z':
                            cmd = 'Z';
                            if( startPoint ){
                                cpx = startPoint[ 0 ];
                                cpy = startPoint[ 1 ];
                                startPoint = null;
                            }else{
                                cpx = 0;
                                cpy = 0;
                            }
                            p.shift();
                            points = [ cpx , cpy ];
                            break;
                    }

                    ca.push({
                        command: cmd || c,
                        points: points,
                        start: {
                            x: startX,
                            y: startY
                        }
                    });
                }

                
            }
            return ca;
        }

    }
}

module createjs.Graphics{

    export class SVGArc{

        r0:number;
        r1:number;
        cx:number;
        cy:number;
        phi:number;
        rx:number;
        ry:number;
        start:number;
        end:number;
        fS:boolean;
        x2:number[];

        mag( v ){
            return Math.sqrt( Math.pow( v[ 0 ] , 2 ) + Math.pow( v[ 1 ] , 2 ) );
        }

        meanVec( u , v ){
            return [ ( u[ 0 ] + v[ 0 ]) / 2.0 , ( u[ 1 ] + v[ 1 ] ) / 2.0 ];
        }

        dot( u , v ){
            return ( u[ 0 ] * v[ 0 ] + u[ 1 ] * v[ 1 ] );
        }

        ratio( u , v ){
            return this.dot( u , v ) / ( this.mag( u ) * this.mag( v ) );
        }


        rotClockwise( v , angle ){
            var cost = Math.cos( angle );
            var sint = Math.sin( angle );
            return [ cost * v[ 0 ] + sint * v[ 1 ] , -1 * sint * v[ 0 ] + cost * v[ 1 ] ];
        }
 
        pointMul( u , v ){
            return [ u[ 0 ] * v[ 0 ] , u[ 1 ] * v[ 1 ] ];
        }
 
        scale( c , v ){
            return [ c * v[ 0 ] , c * v[ 1 ] ];
        }
 
        sum( u , v ){
            return [ u[ 0 ] + v[ 0 ] , u[ 1 ] + v[ 1 ] ];
        }
 
        angle( u , v ){
            var sign = 1.0;
            if( ( u[ 0 ] * v[ 1 ] - u[ 1 ] * v[ 0 ] ) < 0 ){
                sign = -1.0;
            }
            return sign * Math.acos( this.ratio( u , v ) );
        }

        rotCounterClockwise( v , angle ){
            var cost = Math.cos( angle );
            var sint = Math.sin( angle );
            return [ cost * v[ 0 ] - sint * v[ 1 ] , sint * v[ 0 ] + cost * v[ 1 ] ];
        }

        midPoint( u , v ){
            return [ ( u[ 0 ] - v[ 0 ] ) / 2.0 , ( u[ 1 ] - v[ 1 ] ) / 2.0 ];
        }

        constructor( x1:number[] , rx:number , ry:number , phi:number , fA:boolean , fS:boolean , x2:number[] ){
            this.rx = rx;
            this.ry = ry;
            this.x2 = x2;
            if( rx == 0 || ry == 0 ){
                return;
            }
            var phi = phi * ( Math.PI / 180.0 );
            rx = Math.abs( rx );
            ry = Math.abs( ry );
            var xPrime = this.rotClockwise( this.midPoint( x1 , x2 ) , phi );                // F.6.5.1
            var xPrime2 = this.pointMul( xPrime , xPrime );
            var rx2 = Math.pow( rx , 2 );
            var ry2 = Math.pow( ry , 2 );
 
            var lambda = Math.sqrt( xPrime2[ 0 ] / rx2 + xPrime2[ 1 ] / ry2 );
            if( lambda > 1 ){
                rx *= lambda;
                ry *= lambda;
                rx2 = Math.pow( rx , 2 );
                ry2 = Math.pow( ry , 2 );
            }
            var t = ( rx2 * ry2 - rx2 * xPrime2[ 1 ] - ry2 * xPrime2[ 0 ] );
            if( t > -.000001 && t < .000001 ){
                t=0; 
            }
            var b = ( rx2 * xPrime2[ 1 ] + ry2 * xPrime2[ 0 ] );
            if( b > -.000001 && b < .000001 ){
                b=0; 
            }
            var factor = Math.sqrt( t / b );
            if( fA == fS ){
                factor *= -1.0;
            }
            var cPrime = this.scale( factor , [ rx * xPrime[ 1 ] / ry , -ry * xPrime[ 0 ] / rx ] );
            var c = this.sum( this.rotCounterClockwise( cPrime , phi ) , this.meanVec( x1 , x2 ) );
            var x1UnitVector = [ ( xPrime[ 0 ] - cPrime[ 0 ] ) / rx , ( xPrime[ 1 ] - cPrime[ 1 ] ) / ry ];
            var x2UnitVector = [ ( -1.0 * xPrime[ 0 ] - cPrime[ 0 ] ) / rx , ( -1.0 * xPrime[ 1 ] - cPrime[ 1 ] ) / ry ];
            var theta = this.angle( [ 1 , 0 ] , x1UnitVector );
            var deltaTheta = this.angle( x1UnitVector , x2UnitVector );
            if( isNaN( deltaTheta ) ){
                deltaTheta = Math.PI;
            }
            var start = theta;
            var end = theta + deltaTheta;
            this.cx = c[ 0 ];
            this.cy = c[ 1 ];
            this.phi = phi;
            this.rx = rx;
            this.ry = ry;
            this.start = start;
            this.end = end;
            this.fS = !fS;
        }

        exec( ctx:CanvasRenderingContext2D ){
            if( this.rx == 0 || this.ry == 0 ){
                ctx.lineTo( this.x2[ 0 ] , this.x2[ 1 ] );
                return;
            }
            ctx.translate( this.cx , this.cy );
            ctx.rotate( this.phi );
            ctx.scale( this.rx , this.ry );
            ctx.arc( 0 , 0 , 1 , this.start , this.end , this.fS );
            ctx.scale( 1 / this.rx , 1 / this.ry );
            ctx.rotate( -this.phi );
            ctx.translate( -this.cx , -this.cy );
        }
    }
}