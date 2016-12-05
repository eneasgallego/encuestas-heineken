module.exports = function(config) {
//    console.log(config);
    var _db;
    var mongodb = require('mongodb');

    var _doAction = function(action, params) {
        //console.log('new Promise');
        return new Promise(function(resolve, reject) {
            //console.log('check params');
            if (!(params instanceof Array)) {
                params = [];
            }
            //console.log('add callback', params);
            params.push(function (err, result) {
                //console.log('callback');
                if (err) {
                    reject(err);save
                    throw err;
                }
                console.log('resolve');
                resolve(result);
            });
            console.log('apply');
            action.apply(this, params);
        });
    };

    return {
        ObjectID: mongodb.ObjectID,
        conectar: function() {
            return _doAction(mongodb.MongoClient.connect, ['mongodb://' + config.host + '/' + config.name])
                .then(function(result){
                    _db = result;
                });
        },
        getData: function(collection, find) {
            console.log('getData find', find);
            var ret = _db.collection(collection).find(find);
            //console.log('getData 2', ret);
            return ret.toArray();
        },
        createData: function(collection, data) {
            console.log('createData', data)
            return _db.collection(collection).insert(data);
            /*
            return _doAction(_db.collection(collection).insert, [data])
                .then(function(result){
                    console.log(result)
                });
                */
        }
    };
};
