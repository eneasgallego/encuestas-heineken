module.exports = function(mongo) {
    var usuariosDao = require('./dao/usuarios.js')(mongo);
    var encuestasDao = require('./dao/encuestas.js')(mongo);
    var _parseEncuesta = function(encuesta, usuarios) {
        return new Promise(function(resolve, reject) {
            if (usuarios) {
                var usuario = usuarios.find(function(usuario) {
                    return usuario._id == encuesta.usuario;
                });
                encuesta.usuario = usuario;
                resolve(encuesta);
            } else {
                usuariosDao.getUsuarios()
                    .then(function(usuarios) {
                        var prom = _parseEncuesta(encuesta, usuarios);
                        prom.then(function(usuarios) {
                            resolve(usuarios);
                        });
                    }).catch(reject);
            }
        });
    };
    var _invertParseEncuesta = function(encuesta) {
        if (typeof(encuesta.usuario) === 'object') {
            encuesta.usuario = encuesta.usuario._id;
        }
        return encuesta;
    };

    return {
        _path: 'encuestas',
        _get: function(req, res) {
            encuestasDao.getEncuestas().then(res.send);
        },
        _post: function(req, res) {
            encuestasDao.createEncuesta(_invertParseEncuesta(req.body)).then(function(encuesta){
                _parseEncuesta(encuesta).then(function(encuesta) {
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
            },
            _put: function(req, res) {
                encuestasDao.updateEncuesta(req.params._id, _invertParseEncuesta(req.body)).then(function(encuesta){
                    _parseEncuesta(encuesta).then(function(encuesta) {
                        res.send(encuesta);
                    });
                }).catch(function(obj){
                    res.status(500).send(obj);
                });
            }
        }
    };
};
