module.exports = function(app) {
    var multer = require('multer');
    app.post('/api/imagen', multer({ dest: './uploads/'}).single('upl'), function(req,res){
        //form files
        //console.log('form files', req.file);
        /* example output:
         { fieldname: 'upl',
         originalname: 'grumpy.png',
         encoding: '7bit',
         mimetype: 'image/png',
         destination: './uploads/',
         filename: '436ec561793aa4dc475a88e84776b1b9',
         path: 'uploads/436ec561793aa4dc475a88e84776b1b9',
         size: 277056 }
         */
        res.end(req.file.path);
    });
};
