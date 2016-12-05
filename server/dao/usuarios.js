module.exports = function(mongo) {
    return {
        getUsuarios: function() {
            return mongo.getData('usuarios');
        },
        getUsuario: function(id) {
            return mongo.getData('usuarios', {_id: id});
        }
    };
};
