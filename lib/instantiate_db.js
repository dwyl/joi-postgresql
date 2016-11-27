'use strict';

var handlers = require('./db_handlers.js');

var exposedHandlers = ['select', 'update', 'delete', 'insert'];

function fail (client, cb) {
  return function (err) {
    var release = client.release;

    if (typeof release === 'function') {
      release();
    }

    return cb ? cb(err) : null;
  };
}

function bindPoolClient (schema, handler, pool) {
  return function (options, cb) {
    return pool.connect()
      .then(function (client) {
        return handlers[handler](client, schema, options)
          .then(function (result) {
            client.release();

            return cb ? cb(null, result) : result;
          })
          .catch(fail(client, cb))
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

function instantiateDb (pool, schema, callback) {
  return bindPoolClient(schema, 'init', pool)(null, function (err) {
    return callback(err, bindHandlers(pool, schema));
  });
}

module.exports = instantiateDb;
module.exports.fail = fail;
