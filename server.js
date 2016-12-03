// importar
var express = require('express');
var path = require('path');

// instanciar
var app = express();

// ruteo
/*
app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});
*/
app.use('/', express.static(path.join(__dirname, '/public')));
app.use('/', express.static(path.join(__dirname, '/public/dist')));

// escuchar
app.listen(9000);

console.log("Servidor Express escuchando en modo %s", app.settings.env);