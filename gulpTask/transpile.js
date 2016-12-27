const gulp = require('gulp');
const $ = require('gulp-load-plugins')({
    lazy: true,
    camelize: true
});

const utility = require('./utility.js');

const babelify = require('babelify');
const browserify = require('browserify');
const buffer = require('vinyl-buffer');
const source = require('vinyl-source-stream');

gulp.task('transpile', function() {
    utility.log('ES6 code transpile, bundling and uglify...');
    let bundledScript = 'bundle.js';
    let entryPoint = ['./src/frontend/js/entry.js'];
    let destDir = './public/js';
    return browserify(entryPoint, {
            debug: true
    }).transform(babelify, {
            presets: ['es2015'],
            sourceMaps: true
        }).bundle()
        .on('error', function(error) {
            console.error(error);
        })
        .pipe(source(bundledScript))
        .pipe(buffer())
        .pipe($.sourcemaps.init({
            loadMaps: true
        }))
        /*
        .pipe($.uglify({
            mangle: false,
            compress: {
                sequences: false
            }
        }))*/
        .pipe($.sourcemaps.write('./', {
            sourceRoot: './src/frontend'
        }))
        .pipe(gulp.dest(destDir));
});
