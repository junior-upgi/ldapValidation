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
const eventStream = require('event-stream');

require('./lint.js');

gulp.task('transpile', ['lint'], function() {
    utility.log('ES6 code transpile, bundling and uglify...');
    let entryPointList = [
        './src/frontend/js/login.js'
    ];
    let destDir = './public/js';
    let taskList = entryPointList.map(function(entryPoint) {
        return browserify(entryPoint, {
                debug: true
            }).transform(babelify, {
                presets: ['es2015'],
                sourceMaps: true
            }).bundle()
            .on('error', function(error) {
                console.error(error);
            })
            .pipe(source(entryPoint.slice(18)))
            .pipe($.rename({
                extname: '.bundle.js'
            }))
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
    return eventStream.merge.apply(null, taskList);
});
