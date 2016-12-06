module.exports = function(mongo) {
    return {
        getEncuestas: function() {
            return mongo.getData('encuestas');
        },
        getEncuesta: function(_id) {
            return new Promise(function(resolve, reject) {
                mongo.getData('encuestas', {_id: mongo.ObjectID.createFromHexString(_id)})
                    .then(function(encuestas) {
                        if (encuestas.length) {
                            //console.log('resolve', encuestas[0]);
                            resolve(encuestas[0]);
                        } else {
                            reject();
                        }
                    }).catch(reject);
            });
        },
        createEncuesta: function(encuesta) {
            return mongo.createData('encuestas', encuesta);
        },
        updateEncuesta: function(_id, encuesta) {
            return mongo.updateObj('encuestas', _id, encuesta);
        }
    };
};
