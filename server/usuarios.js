(function() {
    var Buffer = require('buffer').Buffer;

    module.exports = function(mongo) {
        var usuariosDao = require('./dao/usuarios.js')(mongo);
        return [{
            _path: 'usuarios',
            _get: function(req, res) {
                console.log('get usuarios');
                usuariosDao.getUsuarios().then(function(usuarios){
                    res.send(usuarios);
                });
            },
            usuario: {
                _path: ':_id',
                _get: function(req, res) {
                    usuariosDao.getUsuario(req.params._id).then(function(usuario){
                        res.send(usuario);
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
                var authorization = req.headers.authorization.substring(6);
                var pwd = new Buffer(authorization, 'base64').toString().split(' ');
                var u = pwd[0];
                var p = pwd[1];
                usuariosDao.login(u,p).then(function(usuario){
                    req.session.usuario = usuario;
                    req.session.save();
                    res.send();
                }).catch(function(err){
                    res.status(401).send('Usuario o contraseña incorrectos.');
                })

            }
        },{
            _path: 'usuario',
            _get: function(req, res) {
                res.send(req.session.usuario);
            }
        }];
    };
})();
