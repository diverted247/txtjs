var gulp = require('gulp');
var ts = require( 'gulp-tsc' );
var connect = require( 'gulp-connect' );
var shell = require( 'gulp-shell' );

// 1541 - Claude Garamond was commissioned to create fonts for King Francis I
// of France and established himself as the first type designer.

gulp.task( 'build' , function(){
    return gulp.src( [ './src/txt/build.d.ts' ] )
        .pipe( ts( {
            target: 'ES5',
            out: 'txt.js',
            outDir: './dist',
            emitError: true,
            declaration: true,
            removeComments: true
        } ) )
        .pipe( gulp.dest( './dist' ) );
});

gulp.task( 'server' , [ 'build' ] , function () {
  connect.server({
    port: 1541,
    livereload: false
  })
});

gulp.task( 'browser' , [ 'server' ] , shell.task( [
    /^win/.test( require( 'os' ).platform() ) ? 'start http://localhost:1541/' : 'open http://localhost:1541/'
] ) );

gulp.task( 'default' , [ 'browser' ] );