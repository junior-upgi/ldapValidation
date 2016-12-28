const gulp = require('gulp');
const utility = require('./utility.js');

gulp.task('html', function() {
    utility.log('processing static HTML files');
    let source = './src/frontend/*.html';
    let destDir = './public';
    return gulp.src(source).pipe(gulp.dest(destDir));
});

gulp.task('partialHtml', function() {
    utility.log('processing partial HTML segments');
    let source = './src/frontend/view/**/*.html';
    let destDir = './public/view';
    return gulp.src(source).pipe(gulp.dest(destDir));
});
