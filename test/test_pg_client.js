'use strict';

var url = require('url');
var pg = require('pg');

var parsed, connection;

require('env2')('config.env');

if (!process.env.TEST_DATABASE_URL) {
  throw new Error('TEST_DATABASE_URL must be defined');
}

parsed = url.parse(process.env.TEST_DATABASE_URL);
connection = {
  host: parsed.hostname,
  port: parsed.port,
  database: parsed.pathname.split('/')[1],
  user: (parsed.auth || '').split(':')[0],
  password: (parsed.auth || '').split(':')[1]
};

module.exports = {
  client: new pg.Client(connection),
  pool: new pg.Pool(connection)
};
