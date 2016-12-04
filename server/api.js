module.exports = function(mongo) {
    return {
        _path: 'api',
        usuarios: require('./usuarios.js')(mongo)
    };
};
