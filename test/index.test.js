'use strict';

var test = require('tape');
var Hapi = require('hapi');
var path = require('path');
var plugin = require('../lib/index.js');

var server = new Hapi.Server();

server.connection();

test('Can register DB plugin with `schemaPath` option', function (t) {
  server.register({
    register: plugin,
    options: {
      schemaPath: path.resolve(__dirname, '..', 'example_schema.js'),
      dbConnection: process.env.TEST_DATABASE_URL
    }
  }, function (err) {
    if (err) {
      t.fail(err);
    }

    server.route({
      method: 'GET',
      path: '/',
      handler: function (request, reply) {
        t.equal(typeof request.abase.db.insert, 'function', 'bound insert');
        t.equal(typeof request.abase.db.select, 'function', 'bound select');
        t.equal(typeof request.abase.db.update, 'function', 'bound update');
        t.equal(typeof request.abase.db.delete, 'function', 'bound delete');

        request.abase.db.select({})
          .then(function (result) {
            t.equal(result.rows.length, 0, 'nothing in the DB');
            reply('');
          })
          .catch(function () {
            reply('');
          });
      }
    });

    server.inject({ method: 'GET', url: '/' }, function (response) {
      t.equal(response.statusCode, 200, '200 OK Code');
      t.equal(response.payload, '', 'Empty (normal) response');
      t.end();
    });
  });
});

test('Teardown', function (t) {
  server.endAbaseDb();
  t.end();
});
