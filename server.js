// importar
var express = require('express');
var bodyParser = require('body-parser')
var path = require('path');
var config = require('./dirs.json');
//console.log(config);
var mongo = require('./server/mongo')(config.db);
var api = require('./server/api.js')(mongo);
var imagen = require('./server/imagen.js');

mongo.conectar().then(function(){
    //mongo.getData('usuarios').then(console.log);

    // instanciar
    var app = express();

    // permitir cors
    app.all('*', function(req, res, next) {
        var origin = req.get('origin');
        res.setHeader('Access-Control-Allow-Origin', origin || '*');
        res.setHeader("Access-Control-Allow-Headers", "X-Requested-With");
        res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        next();
    });
    app.disable('x-powered-by');
/*
    app.use(function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });
*/
    // parse application/x-www-form-urlencoded
    app.use(bodyParser.urlencoded({ extended: false }))

    // parse application/json
    app.use(bodyParser.json())

    // ruteo estatico
    app.use('/', express.static(path.join(__dirname, config.destDir)));
    app.use('/', express.static(path.join(__dirname, config.destDir + '/' + config.distDir)));
    app.use('/uploads', express.static(path.join(__dirname, './uploads')));
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

    imagen(app);

    // escuchar
    app.listen(config.server.port);

    console.log("Servidor Express escuchando en modo %s", app.settings.env);
});
