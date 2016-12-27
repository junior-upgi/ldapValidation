const gulp = require('gulp');
const utility = require('./utility.js');

require('./favicon.js');

gulp.task('buildFrontend', ['favicon'], function() {
    utility.log('building frontend client files...');
    return;
});
