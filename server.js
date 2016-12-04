// importar
var express = require('express');
var path = require('path');
var config = require('./dirs.json');

// instanciar
var app = express();

// ruteo
app.use('/', express.static(path.join(__dirname, config.destDir)));
app.use('/', express.static(path.join(__dirname, config.destDir + '/' + config.distDir)));

app.get('/config', function(req, res){
    res.sendFile(__dirname + config.destDir + '/' + config.configDist);
});

// escuchar
app.listen(9000);

console.log("Servidor Express escuchando en modo %s", app.settings.env);