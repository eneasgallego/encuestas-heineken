// importar
var express = require('express');
var path = require('path');
var config = require('./dirs.json');
//console.log(config);
var mongo = require('./server/hnk-mongo')(config.db);
var api = require('./server/api.js')(mongo);

mongo.conectar().then(function(){
    //mongo.getData('usuarios').then(console.log);

    // instanciar
    var app = express();

    // ruteo estatico
    app.use('/', express.static(path.join(__dirname, config.destDir)));
    app.use('/', express.static(path.join(__dirname, config.destDir + '/' + config.distDir)));
    app.get('/config', function(req, res){
        res.sendFile(__dirname + config.destDir + '/' + config.configDist);
    });

    //ruteo dinámico
    var methods = ['_get','_post','_put','_delete'];
    var createApi = function(obj, path) {
        if (!path) {
            path = '';
        }
        path += '/' + obj._path;
        for (var i = 0 ; i < methods.length ; i++) {
            var method = methods[i];
            var fn = obj[method];
            if (typeof(fn) === 'function') {
                console.log('se crea ' + method + ' para ' + path);
                app[method.substring(1)](path, fn);
            }
        }
        for (var key in obj) {
            if (key !== '_path' && !~methods.indexOf(key)) {
                console.log('createApi', key);
                createApi(api[key], path);
            }
        }
    }
    createApi(api);

    // escuchar
    app.listen(config.server.port);

    console.log("Servidor Express escuchando en modo %s", app.settings.env);
});
