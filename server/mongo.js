module.exports = function(config) {
//    console.log(config);
    var _db;
    var mongodb = require('mongodb');

    var _doAction = function(action, params) {
        return new Promise(function(resolve, reject) {
            if (!(params instanceof Array)) {
                params = [];
            }
            params.push(function (err, result) {
                if (err) {
                    reject(err);
                    throw err;
                }
                resolve(result);
            });
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
            var ret = _db.collection(collection).find(find);
            return ret.toArray().catch(function(err){
                console.error(err);
            });
        },
        removeData: function(collection, find) {
            return _db.collection(collection).remove(find);
        },
        createData: function(collection, data) {
            return new Promise(function(resolve, reject) {
                _db.collection(collection).insert(data)
                    .then(function(obj) {
                        resolve(obj.ops[0]);
                    }).catch(function(err){
                        console.error(err);
                    }).catch(reject);
            });
        },
        updateObj: function(collection, _id, data) {
            return new Promise(function(resolve, reject) {
                var find = {_id:mongodb.ObjectID.createFromHexString(_id)};
                delete data._id;
                //console.log('db.' + collection + '.update(' + JSON.stringify(find) + ',' + JSON.stringify(data) + ')')
                _db.collection(collection).update(find, data)
                    .then(function() {
                        this.getData(collection, find).then(function(data) {
                            resolve(data[0]);
                        }).catch(reject);
                    }.bind(this))
                    .catch(function(err){
                        console.error(err);
                    }).catch(reject);
            }.bind(this));
        },
        updateData: function(collection, find, data) {
            return new Promise(function(resolve, reject) {
                _db.collection(collection).update(find, data)
                    .then(function(obj) {
                        resolve(obj);
                    }).catch(function(err){
                        console.error(err);
                    }).catch(reject);
            });
        }
    };
};
