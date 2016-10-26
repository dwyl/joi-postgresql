'use strict';

var test = require('tape');

var dbConn = require('./test_pg_client.js');
var db = require('../lib/db_handlers.js');
var schema = require('../example_schema.js');

var multipleSchema = [{
  table_name: 'table_1', // eslint-disable-line
  fields: { field: { type: 'string', email: true } }
}, {
  table_name: 'table_2', // eslint-disable-line
  fields: { field: { type: 'string', email: true } }
}];

var testInsert = {
  email: 'test@gmail.com',
  dob: '2001-09-27',
  username: 'test'
};
var testTab = schema.table_name;

var client = dbConn.client;

test('init test client', function (t) {
  client.connect(function () {
    client.query('DROP TABLE IF EXISTS ' + schema.table_name);
    client.query('DROP TABLE IF EXISTS table_1');
    client.query('DROP TABLE IF EXISTS table_2', t.end);
  });
});

test('db.init', function (t) {
  db.init(client, schema)
    .then(function () { return client.query('SELECT * from user_data') })
    .then(function (res) {
      t.ok(
        res.fields
          .map(function (field) { return field.name })
          .indexOf('dob') > -1
        , 'table created with a correct field'
      );
      t.end();
    })
  ;
});

test('db.init multiple tables', function (t) {
  function checkFieldExist (res) {
    t.ok(
      res.fields
        .map(function (field) { return field.name })
        .indexOf('field') > -1
      , 'table created with a correct field'
    );
  }
  db.init(client, multipleSchema)
    .then(function () { return client.query('SELECT * from table_1') })
    .then(checkFieldExist)
    .then(function () { return client.query('SELECT * from table_2') })
    .then(checkFieldExist)
    .then(t.end)
  ;
});


test('db.insert & default select w custom where', function (t) {
  db.insert(client, schema, { fields: testInsert, tableName: testTab })
    .then(function () {
      return db.select(client, schema, {
        where: { dob: '2001-09-27' },
        tableName: testTab
      });
    })
    .then(function (res) {
      t.equal(
        res.rows[0].email,
        testInsert.email,
        'email correct'
      );
      t.equal(
        res.rows[0].username,
        testInsert.username,
        'username correct'
      );
      t.equal(
        res.rows[0].dob.getFullYear(),
        new Date(testInsert.dob).getFullYear(),
        'get same date back, though now a date object'
      );
      t.end();
    })
    .catch(function (err) {
      t.fail(err);
      t.end();
    })
  ;
});

test('db.insert x 2 same username error', function (t) {
  t.plan(1);
  db.insert(client, schema, { fields: testInsert, tableName: testTab })
    .then(function () {
      return db.insert(client, schema, {
        fields: testInsert,
        tableName: testTab
      });
    })
    .then(function () {
      t.fails('shouldn\'t allow second insert if unique key given');
    })
    .catch(function () {
      t.pass('shouldn\'t allow second insert if unique key given');
    })
  ;
});

test('db.update w where & custom select w default where', function (t) {
  t.plan(1);
  db.update(client, schema, {
    tableName: testTab,
    fields: { username: 'bob' },
    where: { email: 'test@gmail.com' }
  }).then(function () {
    return db.select(client, schema, {
      tableName: testTab,
      select: ['email', 'username']
    });
  })
  .then(function (res) {
    t.deepEqual(
      res.rows[0],
      {
        email: 'test@gmail.com',
        username: 'bob'
      },
      'username updated'
    );
  })
  .catch(t.fail);
});

test('db.delete w db.select', function (t) {
  t.plan(1);
  db.delete(client, schema, { tableName: testTab, where: { username: 'bob' } })
    .then(function () {
      return db.select(client, schema, { tableName: testTab });
    })
    .then(function (res) { t.equal(res.rows.length, 0, 'nothing left in db') })
    .catch(t.fail)
  ;
});

test('close test DB connections', function (t) {
  client.end(t.end);
});
