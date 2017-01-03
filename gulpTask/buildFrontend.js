const gulp = require('gulp');
const utility = require('./utility.js');

require('./favicon.js');
require('./html.js');
require('./css.js');
require('./transpile.js');

gulp.task('buildFrontend', ['transpile', 'favicon', 'html', 'css'], function() {
    utility.log('building frontend client files...');
    return;
});
