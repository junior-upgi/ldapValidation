const gulp = require('gulp');
const utility = require('./utility.js');

gulp.task('favicon', function() {
    utility.log('process favicon');
    let source = './src/frontend/*.png';
    let destDir = './public';
    return gulp.src(source).pipe(gulp.dest(destDir));
});
