module.exports = function(mongo) {
    return {
        _path: 'encuestas',
        _get: function(req, res) {
            mongo.getData('encuestas').then(function(encuestas){
                res.send(encuestas);
            });
        },
        _post: function(req, res) {
            mongo.createData('encuestas', req.body).then(function(encuesta){
                res.send(encuesta.ops[0]);
            });
        }
    };
};
