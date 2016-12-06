module.exports = function(mongo) {
    var usuariosDao = require('./dao/usuarios.js')(mongo);
    return {
        _path: 'usuarios',
        _get: function(req, res) {
            console.log('get usuarios');
            usuariosDao.getUsuarios().then(function(usuarios){
                res.send(usuarios);
            });
        }
    };
};
