'use strict';

var handlers = require('./db_handlers.js');

var exposedHandlers = ['select', 'update', 'delete', 'insert'];

function bindPoolClient (schema, handler, pool) {
  return function (options, cb) {
    return pool.connect()
      .then(function (client) {
        return handlers[handler](client, schema, options)
          .then(function (result) {
            client.release();

            return cb ? cb(null, result) : result;
          })
          .catch(function (err) {
            client.release();

            return cb ? cb(err) : null;
          })
        ;
      })
      .catch(function (err) {
        return cb ? cb(err) : null;
      })
    ;
  };
}

function bindHandlers (pool, schema) {
  return exposedHandlers.reduce(function (acc, handler) {
    acc[handler] = bindPoolClient(schema, handler, pool);

    return acc;
  }, {});
}

module.exports = function (pool, schema, callback) {
  return bindPoolClient(schema, 'init', pool)(null, function (err) {
    return callback(err, bindHandlers(pool, schema));
  });
};
