module.exports = function(mongo) {
    return {
        _path: 'api',
        usuarios: require('./usuarios.js')(mongo),
        preguntas: require('./preguntas.js')(mongo),
        encuestas: require('./encuestas.js')(mongo)
    };
};
