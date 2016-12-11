module.exports = function(mongo) {
    var usuariosDao = require('./dao/usuarios.js')(mongo);
    var encuestasDao = require('./dao/encuestas.js')(mongo);
    var _parseEncuesta = function(encuestas, usuarios) {
        return new Promise(function(resolve, reject) {
            if (usuarios) {
                var parse = function(encuesta) {
                    var usuario = usuarios.find(function(usuario) {
                        return usuario._id == encuesta.usuario;
                    });
                    encuesta.usuario = usuario;
                };
                if (encuestas instanceof Array) {
                    for (var i = 0 ; i < encuestas.length ; i++) {
                        parse(encuestas[i]);
                    }
                } else {
                    parse(encuestas);
                }

                resolve(encuestas);
            } else {
                usuariosDao.getUsuarios()
                    .then(function(usuarios) {
                        var prom = _parseEncuesta(encuestas, usuarios);
                        prom.then(function(usuarios) {
                            resolve(usuarios);
                        }).catch(reject);
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
            encuestasDao.getEncuestas().then(function(encuestas){
                _parseEncuesta(encuestas).then(function(encuestas) {
                    res.send(encuestas);
                })
                    .catch(function(err){
                        res.status(500).send(err);
                    });
            })
                .catch(function(err){
                    res.status(500).send(err);
                });
        },
        _post: function(req, res) {
            encuestasDao.createEncuesta(_invertParseEncuesta(req.body)).then(function(encuesta){
                _parseEncuesta(encuesta).then(function(encuesta) {
                    res.send(encuesta);
                })
                    .catch(function(err){
                        res.status(500).send(err);
                    });
            })
                .catch(function(err){
                    res.status(500).send(err);
                });
        },
        encuesta: {
            _path: ':_id',
            _get: function(req, res) {
                encuestasDao.getEncuesta(req.params._id).then(function(encuesta){
                    _parseEncuesta(encuesta).then(function(encuesta) {
                        res.send(encuesta);
                    })
                        .catch(function(err){
                            res.status(500).send(err);
                        });
                })
                    .catch(function(err){
                        res.status(500).send(err);
                    });
            },
            _put: function(req, res) {
                encuestasDao.updateEncuesta(req.params._id, _invertParseEncuesta(req.body), req.query.cambio).then(function(encuesta){
                    _parseEncuesta(encuesta).then(function(encuesta) {
                        res.send(encuesta);
                    })
                        .catch(function(err){
                            res.status(500).send(err);
                        });
                }).catch(function(obj){
                    res.status(500).send(obj);
                });
            }
        }
    };
};
