const gulp = require('gulp');
const utility = require('./utility.js');

gulp.task('css', function() {
    utility.log('processing static CSS files');
    let source = './src/frontend/css/*.css';
    let destDir = './public/css';
    return gulp.src(source).pipe(gulp.dest(destDir));
});
