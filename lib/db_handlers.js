'use strict';

var sqlGen = require('./sql_gen.js');

var methods = {
  init: function (client, config, _, cb) {
    return client.query(sqlGen.init(config), cb);
  }
};

['select', 'update', 'delete', 'insert'].forEach(function (method) {
  methods[method] = function (client, _, options, cb) {
    var args = sqlGen[method](options).concat([cb]);

    return client.query.apply(client, args);
  };
});

module.exports = methods;
