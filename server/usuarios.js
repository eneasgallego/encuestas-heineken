(function() {
    var Buffer = require('buffer').Buffer;

    module.exports = function(mongo) {
        var usuariosDao = require('./dao/usuarios.js')(mongo);
        var _parseAuthorization = function(authorization) {
            var pwd = new Buffer(authorization.substring(6), 'base64').toString().split(' ');
            return {
                usr: pwd[0],
                pwd: pwd[1]
            };
        };
        return [{
            _path: 'usuarios',
            _get: {
                supervisor: true,
                fn: function(req, res) {
                    usuariosDao.getUsuarios().then(function(usuarios){
                        res.send(usuarios);
                    })
                    .catch(function(err){
                        res.status(500).send(err);
                    });
                }
            },
            usuario: {
                _path: ':_id',
                _get: function(req, res) {
                    usuariosDao.getUsuario(req.params._id).then(function(usuario){
                        res.send(usuario);
                    })
                        .catch(function(err){
                            res.status(500).send(err);
                        });
                },
                _put: function(req, res) {
                    usuariosDao.updateUsuario(req.params._id, req.body).then(function(usuario){
                        res.send(usuario);
                    }).catch(function(obj){
                        res.status(500).send(obj);
                    });
                },
                cambiarPwd: {
                    _path: 'pwd',
                    _get: function(req, res) {
                        var authorization = req.headers.authorization.substring(6);
                        var pwd = new Buffer(authorization, 'base64').toString().split(' ');
                        var u = pwd[0];
                        var a = pwd[1];
                        var n = pwd[2];
                        var r = pwd[3];
                        usuariosDao.cambiarPwd(u,a,n,r).then(function(){
                            res.send();
                        }).catch(function(err){
                            res.status(err.status).send(err.text);
                        })

                    }
                }
            }
        },{
            _path: 'login',
            _get: function(req, res) {
                var auth = _parseAuthorization(req.headers.authorization);
                usuariosDao.login(auth.usr,auth.pwd).then(function(usuario){
                    req.session.usuario = usuario;
                    req.session.save();
                    res.send();
                }).catch(function(err){
                    res.status(401).send('Usuario o contraseña incorrectos.');
                })

            }
        },{
            _path: 'olvido',
            _post: function(req, res) {
                usuariosDao.olvido(req.body.usr).then(function(usuario, pwd){
                    //enviar email con la nueva contraseña
                    res.send();
                }).catch(function(err){
                    res.status(500).send(err);
                })

            }
        },{
            _path: 'usuario',
            _get: function(req, res) {
                res.send(req.session.usuario);
            }
        },{
            _path: 'salir',
            _get: function(req, res) {
                console.log('salir', req.session.usuario)
                req.session.usuario = null;
                req.session.save();
                res.send();
            }
        }];
    };
})();
