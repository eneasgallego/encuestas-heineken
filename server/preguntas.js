module.exports = function(mongo) {
    var preguntas = require('./preguntas.json');
    return {
        _path: 'preguntas',
        _get: function(req, res) {
            res.send(preguntas);
        }
    };
};
