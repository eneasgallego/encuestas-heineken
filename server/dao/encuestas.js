module.exports = function(mongo) {
    return {
        getEncuestas: function() {
            return mongo.getData('encuestas');
        },
        getEncuesta: function(id) {
            console.log('getEncuesta', id);
            return new Promise(function(resolve, reject) {
                mongo.getData('encuestas', {_id: mongo.ObjectID.createFromHexString(id)})
                    .then(function(encuestas) {
                        console.log('getData encuestas', encuestas);
                        if (encuestas.length) {
                            console.log('resolve', encuestas[0]);
                            resolve(encuestas[0]);
                        } else {
                            reject();
                        }
                    }).catch(reject);
            });
        },
        createEncuesta: function(encuesta) {
            console.log('createEncuesta', encuesta);
            if (typeof(encuesta.usuario) === 'object') {
                encuesta.usuario = encuesta.usuario._id;
            }
            return mongo.createData('encuestas', encuesta);
        }
    };
};
