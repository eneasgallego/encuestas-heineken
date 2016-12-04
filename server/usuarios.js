module.exports = function(mongo) {
    return {
        _path: 'usuarios',
        _get: function(req, res) {
            mongo.getData('usuarios').then(function(usuarios){
                res.send(usuarios);
            });
        }
    };
};
