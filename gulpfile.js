var gulp = require('gulp');
var bower = require('gulp-bower');
var exec = require('child_process').exec;
var mkdirs = require('mkdirs');
var express = require('gulp-express');

var config = {
    bowerDir: './bower_components',
    dataDir: './data',
    dataLogDir: './data/log'
}

gulp.task('bower', function() {
    return bower()
        .pipe(gulp.dest(config.bowerDir))
});

gulp.task('express', function() {
    express.run(['server.js']);
});

var runCommand = function(command) {
    exec(command, function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        if (err !== null) {
            console.log('exec error: ' + err);
        }
    });
}

gulp.task("mongo-start", function() {
    var command = "mongod --fork --dbpath "+config.dataDir+"/ --logpath "+config.dataLogDir+"/mongo.log";
    mkdirs(config.dataDir);
    mkdirs(config.dataLogDir);
    runCommand(command);
});

gulp.task("mongo-stop", function() {
    var command = 'mongo admin --eval "db.shutdownServer();"'
    runCommand(command);
});

gulp.task('default', ['bower', 'express']);
