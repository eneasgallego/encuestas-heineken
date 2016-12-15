module.exports = function(mongo) {
    var md5 = require('md5');
    var tablas = {
        sesiones: 'sesiones',
        usuarios: 'usuarios',
        pwd: 'pwd'
    };

    var aleatorio = function(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    };
    var createPwd = function() {
        var length = aleatorio(8,10);
        var ret = '';
        for (var i = 0 ; i < length ; i++) {
            ret += String.fromCharCode(aleatorio(33, 126));
        }
        return ret;
    };
    return {
        getUsuarios: function() {
            return mongo.getData(tabla.usuarios);
        },
        getUsuario: function(_id) {
            return new Promise(function(resolve, reject) {
                mongo.getData(tablas.usuarios, typeof(_id) === 'object' ? _id : {_id: mongo.ObjectID.createFromHexString(_id)})
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
                mongo.getData(tablas.pwd, {usuario:_id+''})
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
        login: function(nick, p) {
            return new Promise(function(resolve, reject) {
                this.getUsuario({nick:nick})
                    .then(function(usuario) {
                        this.getPwd(usuario._id+'')
                            .then(function(pwd) {
                                pwd == md5(p) ? resolve(usuario) : reject();
                            }.bind(this))
                            .catch(reject);
                    }.bind(this))
                    .catch(reject);
            }.bind(this));
        },
        olvido: function(nick) {
            return new Promise(function(resolve, reject) {
                this.getUsuario({nick:nick})
                    .then(function(usuario) {
                        var pwd = createPwd();
                        this.updatePwd(usuario._id + '', md5(pwd))
                            .then(function(){
                                resolve({
                                    usuario: usuario,
                                    pwd: pwd
                                });
                            })
                            .catch(reject);
                    }.bind(this))
                    .catch(reject);
            }.bind(this));
        },
        updateUsuario: function(_id, usuario) {
            return mongo.updateObj(tablas.usuarios, _id, usuario);
        },
        updatePwd: function(_id, pwd) {
            return mongo.updateData(tablas.pwd, {usuario:_id}, {usuario:_id, pwd:pwd});
        },
        getSesion: function(usuario) {
            return new Promise(function(resolve, reject) {
                console.log('getSesion.usuario', usuario)
                mongo.getData(tablas.sesiones, {usuario:usuario+''})
                    .then(function(sesiones) {
                        console.log('getSesion.sesiones', sesiones)
                        if (sesiones.length) {
                            resolve(sesiones[0]);
                        } else {
                            resolve();
                        }
                    }).catch(reject);
            });
        },
        saveSesion: function(usuario) {
            return new Promise(function(resolve, reject) {
                console.log('saveSesion.usuario', usuario)
                this.getSesion(usuario)
                    .then(function(sesion) {
                        console.log('saveSesion.sesion', sesion)
                        if (sesion) {
                            resolve(sesion);
                        } else {
                            console.log('saveSesion.createData', usuario)
                            mongo.createData(tablas.sesiones, {usuario:usuario+''})
                                .then(resolve);
                        }
                    }).catch(reject);
            }.bind(this));
        }
    };
};
