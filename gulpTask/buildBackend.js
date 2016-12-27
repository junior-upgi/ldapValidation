const gulp = require('gulp');
const utility = require('./utility.js');

gulp.task('buildBackend', function() {
    utility.log('building backend server files...');
    return gulp
        .src('./src/backend/**/*.*')
        .pipe(gulp.dest('./build'));
});
