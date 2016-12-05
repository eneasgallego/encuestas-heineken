module.exports = function(mongo) {
    return {
        getEncuestas: function() {
            return mongo.getData('encuestas');
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
