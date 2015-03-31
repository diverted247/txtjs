module txt {

    export class Accessibility{

        static data:any = [];

        static timeout:any = null;

        static set( element:any ){
            //if an element is not on canvas, do not place into accessibility api
            if( element.stage == null ){
                return;
            }
            //clear timeout if exists
            if( txt.Accessibility.timeout != null ){
                clearTimeout( txt.Accessibility.timeout );
            }
            // add to accessibility elements
            if( element.accessibilityId == null ){
                txt.Accessibility.data.push( element );
                element.accessibilityId = txt.Accessibility.data.length - 1;
            }
            txt.Accessibility.timeout = setTimeout( txt.Accessibility.update , 300 );

        }

        static update(){
            txt.Accessibility.timeout = null;
            var data = txt.Accessibility.data.slice( 0 )
            data.sort( function(a,b){ return a.accessibilityPriority - b.accessibilityPriority } );
            var len = data.length;
            var out = "";
            var currentCanvas = data[0].stage.canvas;
            for( var i = 0; i < len; i++ ){
                if( data[i].stage == null ){
                    continue;
                }
                if( currentCanvas != data[i].stage.canvas ){
                    currentCanvas.innerHTML = out;
                    out = "";
                    currentCanvas = data[i].stage.canvas;
                }
                if( data[i].accessibilityText == null ){
                    out += '<p>' + data[i].text + '</p>';
                }else{
                    out += data[i].accessibilityText;
                }
            }
            currentCanvas.innerHTML = out;
        }

        static clear(){
            txt.Accessibility.data = [];
        }

    }

}