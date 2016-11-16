'use strict';

var test = require('tape');

var dbConn = require('./test_pg_client.js');
var instantiateDb = require('../lib/instantiate_db.js');
var schema = require('../example_schema.js');

var pool = dbConn.pool;

var testInsert = {
  email: 'test@gmail.com',
  dob: '2001-09-27',
  username: 'test'
};
var testTab = schema.tableName;

test('instantiateDb gives obj w/ methods bound to pg.Pool to cb', function (t) {
  instantiateDb(pool, schema, function (err, db) {
    if (err) {
      t.fail(err, 'should work ok');
    }
    t.equal(typeof db.insert, 'function', '.insert method exists');
    t.equal(typeof db.update, 'function', '.update method exists');
    t.equal(typeof db.select, 'function', '.select method exists');
    t.equal(typeof db.delete, 'function', '.delete method exists');
    t.end();
  });
});

test('db bound .insert adds to DB :: promise interface', function (t) {
  instantiateDb(pool, schema, function (_, db) {
    db.insert({ fields: testInsert, tableName: testTab })
      .then(function () {
        return db.select({
          tableName: testTab,
          where: { email: testInsert.email }
        });
      })
      .then(function (result) {
        t.equal(result.rows[0].id.length, 36, 'guid generated');
        t.equal(result.rows[0].email, testInsert.email, 'Email matches');
        t.end();
      })
      .catch(t.fail)
    ;
  });
});

test('db bound .delete removes line from DB :: cb interface', function (t) {
  instantiateDb(pool, schema, function (_, db) {
    db.delete({ tableName: testTab, where: testInsert }, function (deleteErr) {
      if (deleteErr) {
        t.fail(deleteErr);
      }

      db.select({ tableName: testTab }, function (selectErr, result) {
        if (selectErr) {
          t.fail(selectErr);
        }

        t.equal(result.rows.length, 0, 'Nothing left in DB');
        t.end();
      });
    });
  });
});

test('invalid args error for handler given to cb', function (t) {
  instantiateDb(pool, schema, function (_, db) {
    db.delete(
      { tableName: testTab, where: 'Should not be a string' },
      function (handlerError) {
        t.ok(handlerError, 'callback given error from handler being abused');

        t.end();
      }
    );
  });
});

test('pool error', function (t) {
  t.plan(2);

  instantiateDb(pool, schema, function (_, db) {
    pool.end(function () {
      db.delete(
        { tableName: testTab, where: testInsert },
        function (poolError) {
          t.ok(poolError, 'callback given error from failed pool connection');
        }
      );
      db.delete({ tableName: testTab, where: testInsert }).then(function (res) {
        t.notOk(res, 'no returned result if have caught error and no cb');
      });
    });
  });
});

// keep at bottom
test('close test DB connections', function (t) {
  pool.end(t.end);
});
