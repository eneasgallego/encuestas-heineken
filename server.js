// importar
var express = require('express');
var path = require('path');

// instanciar
var app = express();

// ruteo
app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});
app.use('/bower_components', express.static(path.join(__dirname, '/bower_components')));
app.use('/src', express.static(path.join(__dirname, '/src')));

// escuchar
app.listen(9000);

console.log("Servidor Express escuchando en modo %s", app.settings.env);