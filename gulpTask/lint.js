const gulp = require('gulp');
const $ = require('gulp-load-plugins')({
    lazy: true,
    camelize: true
});
const yargs = require('yargs').argv;

const utility = require('./utility.js');

gulp.task('lint', function() {
    utility.log('code evaluation with Eslint and JSCS');
    let fileList = [
        './src/**/*.js',
        './gulpTask/**/*.js',
        './*.js'
    ];
    return gulp
        .src(fileList)
        .pipe($.if(yargs.verbose, $.print()))
        .pipe($.jscs())
        .pipe($.jscsStylish())
        .pipe($.jscs.reporter('fail'))
        .pipe($.eslint())
        .pipe($.eslint.format())
        .pipe($.eslint.failAfterError());
});
