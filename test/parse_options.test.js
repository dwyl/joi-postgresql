'use strict';

var test = require('tape');
var path = require('path');

var parseOptions = require('../lib/parse_options.js');


test('parseOptions.schema', function (t) {
  t.deepEqual(
    parseOptions.schema(
      {
        schema: { object: 'schema' },
        schemaPath: path.resolve(__dirname, '..', 'example_schema.js')
      },
      { app: { abase: { server: 'schema' } } }
    ),
    { server: 'schema' },
    'server trumps schema object'
  );
  t.deepEqual(
    parseOptions.schema(
      {
        schema: { table: 'schema' },
        schemaPath: path.resolve(__dirname, '..', 'example_schema.js')
      },
      { app: {} }
    ),
    { table: 'schema' },
    'schema trumps schemaPath'
  );
  t.deepEqual(
    parseOptions.schema(
      { schemaPath: path.resolve(__dirname, '..', 'example_schema.js') },
      { app: {} }
    ),
    require('../example_schema.js'), // eslint-disable-line
    'schema trumps schemaPath'
  );
  t.end();
});

test('parseOptions.dbConfig', function (t) {
  t.deepEqual(
    parseOptions.dbConfig({ dbConnection: { parsed: 'object' } }),
    { parsed: 'object' },
    'does nothing if config already complete'
  );
  t.deepEqual(
    parseOptions.dbConfig({ dbConnection: 'psql://localhost:5432/testdb' }),
    {
      database: 'testdb',
      host: 'localhost',
      password: undefined, // eslint-disable-line
      port: '5432',
      user: ''
    },
    'parses db url and handles no user and pass'
  );
  t.end();
});
