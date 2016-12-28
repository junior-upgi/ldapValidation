const gulp = require('gulp');
const requireDir = require('require-dir');

const browserSync = require('browser-sync');
const $ = require('gulp-load-plugins')({
    lazy: true,
    camelize: true
});

const serverConfig = require('./src/backend/module/serverConfig.js');
const utility = require('./gulpTask/utility.js');

requireDir('./gulpTask');

gulp.task('help', $.taskListing);

gulp.task('staticFrontendFiles', ['css', 'template', 'partialHtml', 'html', 'favicon'], function() {
    return;
});

gulp.task('startWatcher', ['staticFrontendFiles', 'transpile'], function() {
    let watchList = {
        frontendFileList: ['./src/frontend/**/*.js'],
        staticFrontendFileList: ['./src/frontend/**/*.html', './src/frontend/**/*.css']
    };
    gulp.watch(watchList.frontendFileList, ['transpile']);
    gulp.watch(watchList.staticFrontendFileList, ['staticFrontendFiles']);
});

gulp.task('startServer', ['preRebuild', 'transpile', 'buildBackend', 'buildFrontend'], function() {
    let nodemonOption = {
        script: './build/server.js',
        delayTime: 1,
        env: {
            'PORT': serverConfig.serverPort,
            'NODE_ENV': serverConfig.development ? 'development' : 'production'
        },
        verbose: false,
        ext: 'html js mustache',
        watch: ['./src/backend/'],
        tasks: ['preRebuild', 'transpile', 'buildBackend', 'buildFrontend']
    };
    return $.nodemon(nodemonOption)
        .on('start', function() {
            utility.log('*** server started on: ' + serverConfig.serverUrl);
        })
        .on('restart', function(event) {
            utility.log('*** server restarted and operating on: ' + serverConfig.serverUrl);
            utility.log('files triggered the restart:\n' + event);
        })
        .on('crash', function() {
            utility.log('*** server had crashed...');
        })
        .on('shutdown', function() {
            utility.log('*** server had been shutdown...');
        });
});

gulp.task('startDevelopmentServer', ['preRebuild', 'transpile', 'buildBackend', 'buildFrontend'], function() {
    let nodemonOption = {
        script: './build/server.js',
        delayTime: 1,
        env: {
            'PORT': serverConfig.serverPort,
            'NODE_ENV': serverConfig.development ? 'development' : 'production'
        },
        verbose: false,
        ext: 'html js mustache',
        watch: ['./src/backend/'],
        tasks: ['preRebuild', 'transpile', 'buildBackend', 'buildFrontend']
    };
    return $.nodemon(nodemonOption)
        .on('start', function() {
            utility.log('*** server started on: ' + serverConfig.serverUrl);
            startBrowserSync();
        })
        .on('restart', function(event) {
            utility.log('*** server restarted and operating on: ' + serverConfig.serverUrl);
            utility.log('files triggered the restart:\n' + event);
            setTimeout(function() {
                browserSync.notify('伺服器重新啟動，頁面即將同步重置...');
                browserSync.reload({
                    stream: false
                });
            }, 5000);
        })
        .on('crash', function() {
            utility.log('*** server had crashed...');
        })
        .on('shutdown', function() {
            utility.log('*** server had been shutdown...');
        });
});

function startBrowserSync() {
    if (browserSync.active) {
        return;
    }
    let option = {
        proxy: 'http://localhost:' + serverConfig.serverPort + '/productionHistory/isProdDataForm/index.html?formReference=isProdData',
        port: 9999,
        // files: ['./src/frontend/** /*.*'],
        ghostMode: {
            clicks: true,
            location: false,
            forms: true,
            scroll: true
        },
        injectChanges: true,
        logFileChanges: true,
        logLevel: 'debug',
        logPrefix: 'gulp-output',
        notify: true,
        reloadDelay: 1000
    };
    browserSync(option);
    utility.log('start browserSync on port: ' + serverConfig.serverPort);
}
