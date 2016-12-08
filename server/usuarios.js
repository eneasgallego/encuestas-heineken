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
            }
        }
    };
};
