'use strict';

var sqlGen = require('./sql_gen.js');
var configValidator = require('./config_validator.js');

var methods = {
  init: function (client, config, _, cb) {
    var callback = (!cb && typeof _ === 'function') ? _ : cb;

    configValidator(config);

    return client.query(sqlGen.init(config), callback);
  }
};

['select', 'update', 'delete', 'insert'].forEach(function (method) {
  methods[method] = function (client, config, options, cb) {
    var tableName = config.table_name;
    var args = sqlGen[method](tableName, options).concat([cb]);

    return client.query.apply(client, args);
  };
});

methods.bindAll = function (pool, schema) {
  return [
    'select', 'update', 'delete', 'insert'
  ].reduce(function (acc, method) {
    acc[method] = function (options, cb) {
      return pool.connect()
        .then(function (client) {
          return methods[method](client, schema, options)
            .then(function (result) {
              client.release();

              return cb ? cb(null, result) : result;
            })
            .catch(function (err) {
              client.release();

              return cb ? cb(err) : null;
            });
        });
    };

    return acc;
  }, {});
};

module.exports = methods;
