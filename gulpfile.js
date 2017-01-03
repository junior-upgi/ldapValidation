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

gulp.task('startServer', ['preRebuild', 'lint', 'buildBackend'], function() {
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
        tasks: ['preRebuild', 'lint', 'buildBackend']
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

gulp.task('frontendMonitor', function() {
    let watchList = {
        scriptList: ['./src/frontend/**/*.js'],
        staticFileList: ['./src/frontend/**/*.html', './src/frontend/**/*.css']
    };
    gulp.watch(watchList.scriptList, ['transpile']).on('change', function(event) {
        setTimeout(function() {
            utility.log('File ' + event.path + ' was ' + event.type);
            browserSync.notify('伺服器重新啟動，頁面即將同步重置...');
            browserSync.reload({
                stream: false
            });
        }, 5000);
    });
    gulp.watch(watchList.staticFileList, ['favicon', 'html', 'css']).on('change', function(event) {
        setTimeout(function() {
            utility.log('File ' + event.path + ' was ' + event.type);
            browserSync.notify('伺服器重新啟動，頁面即將同步重置...');
            browserSync.reload({
                stream: false
            });
        }, 5000);
    });
});

gulp.task('startDevelopmentServer', ['preRebuild', 'lint', 'buildBackend', 'buildFrontend', 'frontendMonitor'], function() {
    let nodemonOption = {
        script: './build/server.js',
        delayTime: 1,
        env: {
            'PORT': serverConfig.serverPort,
            'NODE_ENV': serverConfig.development ? 'development' : 'production'
        },
        verbose: false,
        ext: 'html js handlebars',
        watch: ['./src/backend/'],
        tasks: ['preRebuild', 'lint', 'buildBackend', 'buildFrontend']
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
        proxy: 'http://localhost:' + serverConfig.serverPort + '/ldapValidation/login.html',
        port: 9995,
        files: ['./src/frontend/** /*.*'],
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
