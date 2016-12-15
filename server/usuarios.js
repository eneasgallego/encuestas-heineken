(function() {
    var Buffer = require('buffer').Buffer;

    module.exports = function(mongo) {
        var usuariosDao = require('./dao/usuarios.js')(mongo);
        var _parseAuthorization = function(authorization) {
            var pwd = new Buffer(authorization.substring(6), 'base64').toString().split(' ');
            return {
                usr: pwd[0],
                pwd: pwd[1]
            };
        };
        var enviarEmail = function(toEmailAddress, subject, text, html){
            return new Promise(function(resolve,reject) {
                var nodemailer = require('nodemailer');
                var smtpTransport = require('nodemailer-smtp-transport');

                var mailAccountUser = 'eneasgallego@gmail.com';
                var mailAccountPassword = 'Marvel_69';

                var fromEmailAddress = 'info@heineken.com';

                var transport = nodemailer.createTransport(smtpTransport({
                    service: 'gmail',
                    auth: {
                        user: mailAccountUser,
                        pass: mailAccountPassword
                    }
                }))

//                console.log('fromEmailAddress', fromEmailAddress);
//                console.log('toEmailAddress', toEmailAddress);
//                console.log('subject', subject);
//                console.log('text', text);
//                console.log('html', html);
                var mail = {
                    from: fromEmailAddress,
                    to: toEmailAddress,
                    subject: subject,
                    text: text,
                    html: html
                }

                transport.sendMail(mail, function(error, response){
                    if(error){
                        console.log(error);
                        reject(error, response);
                    }else{
//                        console.log("Message sent: " + response.message);
                        resolve(response);
                    }

                    transport.close();
                });
            });
        };
        return [{
            _path: 'usuarios',
            _get: {
                supervisor: true,
                fn: function(req, res) {
                    usuariosDao.getUsuarios().then(function(usuarios){
                        res.send(usuarios);
                    })
                    .catch(function(err){
                        res.status(500).send(err);
                    });
                }
            },
            usuario: {
                _path: ':_id',
                _get: function(req, res) {
                    usuariosDao.getUsuario(req.params._id).then(function(usuario){
                        res.send(usuario);
                    })
                        .catch(function(err){
                            res.status(500).send(err);
                        });
                },
                _put: function(req, res) {
                    usuariosDao.updateUsuario(req.params._id, req.body).then(function(usuario){
                        res.send(usuario);
                    }).catch(function(obj){
                        res.status(500).send(obj);
                    });
                },
                cambiarPwd: {
                    _path: 'pwd',
                    _get: function(req, res) {
                        var authorization = req.headers.authorization.substring(6);
                        var pwd = new Buffer(authorization, 'base64').toString().split(' ');
                        var u = pwd[0];
                        var a = pwd[1];
                        var n = pwd[2];
                        var r = pwd[3];
                        usuariosDao.cambiarPwd(u,a,n,r).then(function(){
                            res.send();
                        }).catch(function(err){
                            res.status(err.status).send(err.text);
                        })

                    }
                }
            }
        },{
            _path: 'login',
            _get: function(req, res) {
                var ncs = !!parseInt(req.query.ncs);
                var auth = _parseAuthorization(req.headers.authorization);
                usuariosDao.login(auth.usr,auth.pwd).then(function(usuario){
                    req.session.usuario = usuario;
                    req.session.save();
                    if (ncs) {
                        usuariosDao.saveSesion(usuario._id)
                            .then(function(sesion){
                                res.cookie('ncs', sesion._id).send();
                            });
                    } else {
                        usuariosDao.removeSesion(usuario._id)
                            .then(function(){
                                res.clearCookie('ncs').send();
                            });
                    }
                }).catch(function(err){
                    res.status(401).send('Usuario o contraseña incorrectos.');
                })

            }
        },{
            _path: 'olvido',
            _post: function(req, res) {
                usuariosDao.olvido(req.body.usr).then(function(data){
                    //enviar email con la nueva contraseña
                    //console.log('data',data);
                    if (data) {
                      //  console.log('pwd olvido',data.pwd);
                        enviarEmail(data.usuario.email, 'Nueva Contraseña', data.pwd, '<b>' + data.pwd + '</b>')
                            .then(function(response) {
                                res.send(response);
                            })
                            .catch(function(err){
                                res.status(500).send(err);
                            });
                    }
                }).catch(function(err){
                    res.status(500).send(err);
                })

            }
        },{
            _path: 'usuario',
            _get: function(req, res) {
                res.send(req.session.usuario);
            }
        },{
            _path: 'salir',
            _get: function(req, res) {
                console.log('salir', req.session.usuario)
                usuariosDao.removeSesion(req.session.usuario._id)
                    .then(function(){
                        res.clearCookie('ncs');
                        req.session.usuario = null;
                        req.session.save();
                        res.send();
                    });
            }
        }];
    };
})();
