// importar
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
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

    //app.use(cookieParser());
    app.use(session({
        secret: 'keyboard cat',
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false }
    }));

    // permitir cors
    app.all('*', function(req, res, next) {
        var origin = req.get('origin');
        res.setHeader('Access-Control-Allow-Origin', origin || '*');
        res.setHeader("Access-Control-Allow-Headers", "X-Requested-With");
        res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        var comprobarUrl = function(a) {
            var ret = false;
            if (a instanceof Array) {
                for (var i = 0 ; i < a.length ; i++) {
                    ret = comprobarUrl(a[i]);
                    if (ret) {
                        break;
                    }
                }
            } else {
                ret = !!~req.originalUrl.indexOf(a);
            }

            return ret;
        };
        var permitir = req.originalUrl != '/' && comprobarUrl([config.distDir, 'login', config.config]);
        //console.log('permitir ' + req.originalUrl, permitir);
        if (permitir) {
            next();
        } else {
            if (req.session.usuario) {
                next();
            } else {
                if (req.xhr) {
                    res.status(403).send('Necesita estar logado.');
                } else {
                    var login = __dirname + config.destDir + '/' + config.login;
                    res.sendFile(login);
                    //next();
                }
            }
        }
    });
    app.disable('x-powered-by');

    // parse application/x-www-form-urlencoded
    app.use(bodyParser.urlencoded({ extended: false }))

    // parse application/json
    app.use(bodyParser.json())

    // ruteo estatico
    app.use('/', express.static(path.join(__dirname, config.destDir)));
    app.use('/' + config.distDir, express.static(path.join(__dirname, config.destDir + '/' + config.distDir)));
    app.use('/' + config.uploads, express.static(path.join(__dirname, './uploads')));
    app.get('/' + config.config, function(req, res){
        res.sendFile(__dirname + config.destDir + '/' + config.configDist);
    });

    //ruteo dinámico
    var methods = ['_get','_post','_put','_delete'];
    var createApi = function(obj, path) {
        if (obj instanceof Array) {
            for (var i = 0 ; i < obj.length ; i++) {
                createApi(obj[i], path);
            }
        } else {
            if (!path) {
                path = '';
            }
            path += '/' + obj._path;
            var createEndpoint = function(fn, method) {
                if (typeof(fn) === 'function') {
                    console.log('se crea ' + method + ' para ' + path);
                    app[method.substring(1)](path, fn);
                } else if (typeof(fn) === 'object') {
                    if (fn.supervisor) {
                        app.use(path, function(req, res, next) {
                            console.log('supervisor en ' + path, !req.session.usuario.supervisor)
                            console.log(req.baseUrl)
                            if (req.session.usuario.supervisor) {
                                next();
                            } else {
                                res.status(403).send('Debe ser supervisor.')
                            }
                        });
                        createEndpoint(fn.fn, method);
                    }
                }
            };
            for (var i = 0 ; i < methods.length ; i++) {
                createEndpoint(obj[methods[i]], methods[i]);
            }
            for (var key in obj) {
                if (key !== '_path' && !~methods.indexOf(key)) {
                    createApi(obj[key], path);
                }
            }
        }
    }
    createApi(api);

    imagen(app);

    // escuchar
    app.listen(config.server.port);

    console.log("Servidor Express escuchando en modo %s", app.settings.env);
});
