const gulp = require('gulp');
const $ = require('gulp-load-plugins')({
    lazy: true,
    camelize: true
});
const del = require('del');

const utility = require('./utility.js');

gulp.task('removePublic', function() {
    let dir = './public';
    utility.log('cleaning: ' + $.util.colors.blue(dir));
    return del.sync(dir);
});

gulp.task('removeBuild', function() {
    let dir = './build';
    utility.log('cleaning: ' + $.util.colors.blue(dir));
    return del.sync(dir);
});

gulp.task('removeTemp', function() {
    let dir = './temp';
    utility.log('cleaning: ' + $.util.colors.blue(dir));
    return del.sync(dir);
});

gulp.task('preRebuild', ['removePublic', 'removeBuild', 'removeTemp'], function() {
    return;
});
