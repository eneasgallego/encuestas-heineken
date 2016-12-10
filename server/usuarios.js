(function() {
    var Buffer = require('buffer').Buffer;

    module.exports = function(mongo) {
        var usuariosDao = require('./dao/usuarios.js')(mongo);
        return {
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
                        console.log('header', req.headers.authorization);
                        var authorization = req.headers.authorization.substring(6);
                        console.log('authorization', authorization);
                        var pwd = new Buffer(authorization, 'base64').toString().split(' ');
                        console.log('pwd', pwd);
                        var u = pwd[0];
                        console.log('u', u);
                        var a = pwd[1];
                        console.log('a', a);
                        var n = pwd[2];
                        console.log('n', n);
                        var r = pwd[3];
                        console.log('r', r);
                        usuariosDao.cambiarPwd(u,a,n,r).then(function(){
                            res.send();
                        }).catch(function(err){
                            res.status(err.status).send(err.text);
                        })

                    }
                }
            }
        };
    };
})();
