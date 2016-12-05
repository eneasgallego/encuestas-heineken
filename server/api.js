module.exports = function(mongo) {
    var api = {
        _path: 'api'
    };
    api.usuarios = require('./usuarios.js')(mongo);
    api.preguntas = require('./preguntas.js')(mongo);
    api.encuestas = require('./encuestas.js')(mongo);

    return api;
};
