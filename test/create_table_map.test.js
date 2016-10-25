'use strict';

var test = require('tape');

var mapper = require('../lib/create_table_map.js');

var mapObj = mapper.mapObj;

test('Boolean type', function (t) {
  t.equal(
    mapObj.boolean({}),
    'BOOLEAN',
    'boolean type: default'
  );
  t.end();
});

test('Date type', function (t) {
  t.equal(
    mapObj.date({}),
    'DATE',
    'date type: default'
  );
  t.equal(
    mapObj.date({ timestamp: true }),
    'TIMESTAMP',
    'date type: timestamp'
  );
  t.end();
});

test('Number type', function (t) {
  t.equal(
    mapObj.number({}),
    'DOUBLE PRECISION',
    'number type: default'
  );
  t.equal(
    mapObj.number({ integer: true }),
    'BIGINT',
    'number type: integer'
  );
  t.end();
});

test('String type', function (t) {
  t.equal(
    mapObj.string({}),
    'VARCHAR(80)',
    'string type: default'
  );
  t.equal(
    mapObj.string({ max: 12 }),
    'VARCHAR(12)',
    'string type: specifies length'
  );
  t.end();
});

test('Create Table Mapper Function', function (t) {
  t.equal(
    mapper('field', 'string', { max: 140 }),
    'field VARCHAR(140)',
    'name added to sql query and options passed through'
  );
  t.end();
});

test('Create Table Mapper Function w/ no options', function (t) {
  t.equal(
    mapper('field', 'string'),
    'field VARCHAR(80)',
    'name added to sql query and default options used'
  );
  t.end();
});

test('Create Table Mapper Function w/ unique option', function (t) {
  t.equal(
    mapper('email', 'string', { unique: true }),
    'email VARCHAR(80) CONSTRAINT email_unique UNIQUE',
    'constraint added to column'
  );
  t.end();
});
