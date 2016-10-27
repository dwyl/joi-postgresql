'use strict';

var test = require('tape');

var validate = require('../lib/config_validator.js');
var dbNameRegEx = validate.dbNameRegEx;

function validator (config) {
  return function () {
    validate(config);
  };
}

test('config validator', function (t) {
  t.throws(
    validator({ fields: {} }),
    'error if no tableName property'
  );
  t.throws(
    validator({ tableName: 'test' }), // eslint-disable-line
    'error if no fields property'
  );
  t.throws(
    validator({
      tableName: '2test',
      fields: {}
    }),
    'error if table name doesn\t pass db name regex'
  );
  t.throws(
    validator({
      tableName: 'test',
      fields: { '2field': { type: 'string' } }
    }),
    'error if field name doesn\'t pass db name regex'
  );
  t.doesNotThrow(
    validator({
      tableName: 'test',
      fields: { email: { type: 'string', unknown: 'allowed' } }
    }),
    'no error when extra options unknown'
  );

  t.end();
});

test('config validator, multiple tables', function (t) {
  t.doesNotThrow(
    validator([{
      tableName: 'test',
      fields: { email: { type: 'string' } }
    }, {
      tableName: 'test_2',
      fields: { email: { type: 'string' } }
    }]),
    'handles multiple tables'
  );

  t.end();
});

test('dbNameRegEx', function (t) {
  t.ok(
    dbNameRegEx.exec('_a1pha_Numer1c'),
    'alpha numeric keys allowed only'
  );
  t.notOk(
    dbNameRegEx.exec(''),
    'alpha numeric keys allowed only'
  );
  t.notOk(
    dbNameRegEx.exec('no£way'),
    'no other characters allowed'
  );
  t.notOk(
    dbNameRegEx.exec('3Numer1c'),
    'must only start with a _ or letter'
  );
  t.notOk(
    dbNameRegEx.exec(
      '_morethan63characters_morethan63characters_morethan63characters_'
    ),
    '63 character limit for field names'
  );

  t.end();
});
