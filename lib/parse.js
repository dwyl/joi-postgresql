'use strict';

var url = require('url');

exports.schema = function (schema, schemaPath) {
  var sch;

  if (!schema || Object.keys(schema).length === 0) {
    sch = require(schemaPath); // eslint-disable-line
  } else {
    sch = schema;
  }

  return sch;
};


exports.dbConfig = function (dbConnection) {
  var parsed;

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
