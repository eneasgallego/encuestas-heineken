// importar
var express = require('express');
var bodyParser = require('body-parser')
var path = require('path');
var config = require('./dirs.json');
//console.log(config);
var mongo = require('./server/mongo')(config.db);
var api = require('./server/api.js')(mongo);

mongo.conectar().then(function(){
    //mongo.getData('usuarios').then(console.log);

    // instanciar
    var app = express();

    // parse application/x-www-form-urlencoded
    app.use(bodyParser.urlencoded({ extended: false }))

    // parse application/json
    app.use(bodyParser.json())

    // ruteo estatico
    app.use('/', express.static(path.join(__dirname, config.destDir)));
    app.use('/', express.static(path.join(__dirname, config.destDir + '/' + config.distDir)));
    app.get('/config', function(req, res){
        res.sendFile(__dirname + config.destDir + '/' + config.configDist);
    });

    //ruteo dinámico
    var methods = ['_get','_post','_put','_delete'];
    var createApi = function(obj, path) {
        //console.log('path', path);
        if (!path) {
            path = '';
        }
        //console.log('obj', obj);
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
                //console.log('createApi', key);
                createApi(obj[key], path);
            }
        }
    }
    createApi(api);

    // escuchar
    app.listen(config.server.port);

    console.log("Servidor Express escuchando en modo %s", app.settings.env);
});
