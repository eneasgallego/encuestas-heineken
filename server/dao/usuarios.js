module.exports = function(mongo) {
    var md5 = require('md5');
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
        getPwd: function(_id) {
            return new Promise(function(resolve, reject) {
                mongo.getData('pwd', {usuario:_id})
                    .then(function(usuarios) {
                        if (usuarios.length) {
                            resolve(usuarios[0].pwd);
                        } else {
                            reject();
                        }
                    }).catch(reject);
            });
        },
        cambiarPwd: function(_id, antigua, nueva, repetir) {
            return new Promise(function(resolve, reject) {
                this.getPwd(_id)
                    .then(function(pwd) {
                        if (nueva == repetir) {
                            if (pwd == md5(antigua)) {
                                this.updatePwd(_id, md5(nueva))
                                    .then(resolve);
                            } else {
                                reject({
                                    status: 401,
                                    text: 'Usuario o contraseña no válidos'
                                })
                            }
                        } else {
                            reject({
                                status: 400,
                                text: 'Contraseña nueva y repetida deben ser iguales.'
                            })
                        }
                    }.bind(this)).catch(function() {
                        reject({
                            status: 401,
                            text: 'Usuario o contraseña no válidos.'
                        })
                    });
            }.bind(this));
        },
        updateUsuario: function(_id, usuario) {
            return mongo.updateObj('usuarios', _id, usuario);
        },
        updatePwd: function(_id, pwd) {
            return mongo.updateData('pwd', {usuario:_id}, {usuario:_id, pwd:pwd});
        }
    };
};
