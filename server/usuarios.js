module.exports = function(mongo) {
    var usuariosDao = require('./dao/usuarios.js')(mongo);
    return {
        _path: 'usuarios',
        _get: function(req, res) {
            usuariosDao.getUsuarios().then(function(usuarios){
                res.send(usuarios);
            });
            /*mongo.getData('usuarios').then(function(usuarios){
                res.send(usuarios);
            });*/
        }
    };
};
