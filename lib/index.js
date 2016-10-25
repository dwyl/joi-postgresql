/*
 * Abase DB plugin
 *
 * Accepts path the schema defining the user model in the plugin options,
 * or relies on the schema attached to the server settings object.
 *
 * Provides database helper functions to do schema-compatible CRUD operations.
 * Attaches these methods to the request object at the pre-handler lifecycle
 * point.
 */
'use strict';

var pg = require('pg');
var db = require('./helpers.js');
var parse = require('./parse.js');

exports.register = function (server, options, next) {
  var schema = parse.schema(server.app.abase || {}, options.schemaPath);

  var connection = parse.dbConfig(options.dbConnection);
  var pool = new pg.Pool(connection);

  pool.connect(function (dbConnErr, client, release) {
    if (dbConnErr) {
      return next(dbConnErr);
    }

    return db.init(client, schema, function (dbErr) {
      release();

      if (dbErr) {
        return next(dbErr);
      }

      server.ext('onPreHandler', function (request, reply) {
        request.abase = { db: db.bindAll(pool, schema) };
        reply.continue();
      });

      server.decorate('server', 'endAbaseDb', function () {
        pool.end();
      });

      return next();
    });
  });
};

exports.register.attributes = { name: 'abase-db' };
