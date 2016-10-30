'use strict';

var test = require('tape');
var Hapi = require('hapi');
var path = require('path');
var plugin = require('../lib/index.js');


test('Can register DB plugin with `schemaPath` option', function (t) {
  var server = new Hapi.Server();

  server.connection();
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
      server.endAbaseDb(t.end);
    });
  });
});

test('db handlers exposed', function (t) {
  var handlers = Object.keys(plugin.handlers);
  var wanted = ['insert', 'select', 'delete', 'update', 'init', 'flush'];

  t.ok(
    wanted.reduce(function (truth, handler) {
      return truth && handlers.indexOf(handler) > -1;
    }, true),
    'all handlers found: ' + wanted.join(', ')
  );
  t.end();
});

test('validate exposed', function (t) {
  t.ok(
    typeof plugin.validate === 'function',
    'validate function given'
  );
  t.end();
});

test('createClient helper', function (t) {
  var testClient = plugin.createClient(process.env.TEST_DATABASE_URL);

  t.ok(testClient.connection, 'client object returned');
  t.end();
});
