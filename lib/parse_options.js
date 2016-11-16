'use strict';

var url = require('url');

exports.schema = function (options, server) {
  return server.app.abase
    || options.schema
    || require(options.schemaPath) // eslint-disable-line
  ;
};


exports.dbConfig = function (options) {
  var parsed;
  var dbConnection = options.dbConnection;

  if (typeof dbConnection === 'string') {
    parsed = url.parse(dbConnection);

    return {
      host: parsed.hostname,
      port: parsed.port,
      database: parsed.pathname.split('/')[1],
      user: (parsed.auth || '').split(':')[0],
      password: (parsed.auth || '').split(':')[1]
    };
  }

  return dbConnection;
};
