module.exports = function(mongo) {
    var usuariosDao = require('./dao/usuarios.js')(mongo);
    var encuestasDao = require('./dao/encuestas.js')(mongo);
    var _parseEncuesta = function(encuesta, usuarios) {
        return new Promise(function(resolve, reject) {
            console.log('usuarios', usuarios);
            if (usuarios) {
                var usuario = usuarios.find(function(usuario) {
                    return usuario._id == encuesta.usuario;
                });
                console.log('usuario', usuario);
                encuesta.usuario = usuario;
                console.log('resolve', encuesta);
                resolve(encuesta);
            } else {
                console.log('getUsuarios');
                usuariosDao.getUsuarios()
                .then(function(usuarios) {
                    console.log('_parseEncuesta 2', usuarios);
                    var prom = _parseEncuesta(encuesta, usuarios);
                    console.log('instanceof', prom instanceof Promise);
                    prom.then(function(usuarios) {
                        console.log('_parseEncuesta 2 cb', usuarios);
                        resolve(usuarios);
                    });
                }).catch(reject);
            }
        });
    };

    return {
        _path: 'encuestas',
        _get: function(req, res) {
            encuestasDao.getEncuestas().then(res.send);
        },
        _post: function(req, res) {
            encuestasDao.createEncuesta(req.body).then(function(encuesta){
                _parseEncuesta(encuesta.ops[0]).then(function(encuesta) {
                    res.send(encuesta);
                });
            });
        },
        encuesta: {
            _path: ':_id',
            _get: function(req, res) {
                encuestasDao.getEncuesta(req.params._id).then(function(encuesta){
                    _parseEncuesta(encuesta).then(function(encuesta) {
                        res.send(encuesta);
                    });
                });
            }
        }
    };
};
