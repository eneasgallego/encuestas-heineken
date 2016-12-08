module.exports = function(mongo) {
    return {
        getUsuarios: function() {
            return mongo.getData('usuarios');
        },
        getUsuario: function(_id) {
            return new Promise(function(resolve, reject) {
                mongo.getData('usuarios', {_id: mongo.ObjectID.createFromHexString(_id)})
                    .then(function(usuarios) {
                        if (usuarios.length) {
                            resolve(usuarios[0]);
                        } else {
                            reject();
                        }
                    }).catch(reject);
            });
        },
        updateUsuario: function(_id, encuesta) {
            return mongo.updateObj('encuestas', _id, encuesta);
        }
    };
};
