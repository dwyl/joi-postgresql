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

var parseOptions = require('./parse_options.js');
var instantiateDb = require('./instantiate_db.js');
var configValidator = require('./config_validator.js');
var handlers = require('./db_handlers.js');

exports.register = function (server, options, next) {
  var schema = parseOptions.schema(options, server);
  var connection = parseOptions.dbConfig(options);
  var pool = new pg.Pool(connection);

  configValidator(schema);

  return instantiateDb(pool, schema, function (dbErr, db) {
    server.ext('onPreAuth', function (request, reply) {
      request.abase = { db: db };
      reply.continue();
    });

    server.decorate('server', 'endAbaseDb', function (cb) {
      pool.end(cb);
    });

    return next(dbErr);
  });
};

exports.register.attributes = { name: 'abase-db' };

exports.handlers = handlers;

exports.validate = configValidator;

exports.createClient = function (dbConnection) {
  var connection = parseOptions.dbConfig({ dbConnection: dbConnection });

  return new pg.Client(connection);
};
