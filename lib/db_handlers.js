'use strict';

var sqlGen = require('./sql_gen.js');

var methods = {};

function multipleQuery (client, queries, cb) {
  function nextQuery () {
    var last = queries.length === 1;

    return client.query(queries.pop(), !last ? nextQuery : cb);
  }

  return nextQuery();
}

methods.init = function (client, config, _, cb) {
  var tables = [].concat(config);
  var queries = tables.map(sqlGen.init);

  return multipleQuery(client, queries, cb);
};

methods.flush = function (client, config, options, cb) {
  var tables = [].concat(options || config);
  var queries = tables.map(sqlGen.dropTable);

  return multipleQuery(client, queries, cb);
};

['select', 'update', 'delete', 'insert'].forEach(function (method) {
  methods[method] = function (client, config, options, cb) {
    var args = sqlGen[method](config, options).concat([cb]);

    return client.query.apply(client, args);
  };
});

methods.query = function (client, config, options, cb) {
  return client.query(options.raw, cb);
};

module.exports = methods;
