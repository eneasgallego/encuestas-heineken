var gulp = require('gulp');
var bower = require('gulp-bower');
var express = require('gulp-express');
var rename = require('gulp-rename');
var gutil = require('gulp-util');

var config = require('./dirs.json');

gulp.task('bower', bower);

gulp.task('build-static', function() {
    return gulp.src(['.' + config.staticDir + '/**'])
        .pipe(gulp.dest('.' + config.destDir));
});
gulp.task('build-src', function() {
    return gulp.src(['.' + config.srcDir + '/**'])
        .pipe(gulp.dest('.' + config.destDir + '/' + config.distDir));
});

var doConfig = function(src){
    gutil.log('src: ' + '.' + src);
    gutil.log('configDist: ' + config.configDist);
    gutil.log('destDir: ' + '.' + config.destDir);
    return gulp.src('.' + src)
        .pipe(rename(config.configDist))
        .pipe(gulp.dest('.' + config.destDir));
};
gulp.task('config-dev', function(){
    return doConfig(config.configDev);
});
gulp.task('config-pro', function(){
    return doConfig(config.configPro);
});

gulp.task('express', function() {
    express.run(['server.js']);
});

var exec = require('child_process').exec;

function runCommand(command) {
    return function (cb) {
        exec(command, function (err, stdout, stderr) {
            console.log(stdout);
            console.log(stderr);
            cb(err);
        });
    }
}

//Running mongo
//http://stackoverflow.com/a/28048696/46810
gulp.task('start-mongo', runCommand('mongod --dbpath data'));
gulp.task('stop-mongo', runCommand('mongo --eval "use admin; db.shutdownServer();"'));


gulp.task('build',      ['build-static', 'build-src']);
gulp.task('build-all',  ['bower', 'build']);
gulp.task('dev',        ['build', 'config-dev']);
gulp.task('pro',        ['build', 'config-pro']);
gulp.task('dev-all',    ['build-all', 'config-dev']);
gulp.task('pro-all',    ['build-all', 'config-pro']);

gulp.task('default',    ['dev', 'start-mongo', 'express']);
