'use strict';

var env = require('env2')('config.env'); // eslint-disable-line

var Hapi = require('hapi');
var hoek = require('hoek');
var AbaseDb = require('../lib/');
var routes = require('./routes.js');
var dbSchema = require('./schema.js');

var server = new Hapi.Server();

var abaseDbOptions = {
  dbConnection: process.env.TEST_DATABASE_URL,
  schema: dbSchema
};

server.connection({ port: 8000 });

server.register([
  { register: AbaseDb, options: abaseDbOptions }
], function (err) {
  hoek.assert(!err, err);

  server.route(routes);

  server.start(function (error) {
    hoek.assert(!error, error);

    console.log('Visit: http://localhost:' + server.info.port + '/'); // eslint-disable-line
  });
});

module.exports = server;
