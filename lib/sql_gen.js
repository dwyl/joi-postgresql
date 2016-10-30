'use strict';

var mapper = require('./create_table_map.js');
var _ = require('./utils.js');


function paramStr (columns, opts) {
  var offset = (opts && opts.offset) || 0;
  var assign = (opts && opts.assign) || false;

  return columns.map(function (k, i) {
    var suff = '$' + (1 + i + (offset || 0));
    var pref = assign ? k + '=' : '';

    return pref + suff;
  });
}


function processWhere (where, query, values) {
  var keys = Object.keys(where);
  var conds = paramStr(keys, { offset: values.length, assign: true });
  var vals = _.values(where, keys);

  return {
    query: query.concat('WHERE').concat(conds.join(' AND ')),
    values: values.concat(vals)
  };
}


exports.init = function init (config) {
  var tableName = config.tableName;
  var fields = config.fields;

  var columns = Object.keys(fields).map(function (key) {
    var type = fields[key].type;
    var opts = _.except(['type'], fields[key]);

    return mapper(key, type, opts, tableName);
  });

  return ['CREATE TABLE IF NOT EXISTS "' + tableName + '"']
    .concat('(' + columns.join(', ') + ')')
    .join(' ')
    .trim();
};


exports.select = function select (options) {
  var columns = options.select || ['*'];
  var values = [];
  var query = ['SELECT']
    .concat(columns.join(', '))
    .concat('FROM')
    .concat('"' + options.tableName + '"');
  var result;

  if (options.where) {
    result = processWhere(options.where, query, values);
    query = result.query;
    values = result.values;
  }

  query = query.join(' ').trim();

  return [query, values];
};


exports.insert = function insert (options) {
  var fields = options.fields || {};
  var columns = Object.keys(fields);
  var values = _.values(fields, columns);
  var params = paramStr(columns);

  var query = ['INSERT INTO "' + options.tableName + '"']
    .concat('(' + columns.join(', ') + ')')
    .concat('VALUES')
    .concat('(' + params.join(', ') + ')')
    .join(' ')
    .trim();

  return [query, values];
};


exports.update = function update (options) {
  var fields = options.fields || {};
  var columns = Object.keys(fields);
  var conditions = paramStr(columns, { assign: true });
  var values = _.values(fields, columns);

  var query = ['UPDATE "' + options.tableName + '"']
    .concat('SET')
    .concat(conditions.join(', '));
  var result;

  if (options.where) {
    result = processWhere(options.where, query, values);
    query = result.query;
    values = result.values;
  }

  query = query.join(' ').trim();

  return [query, values];
};


exports.delete = function _delete (options) {
  var query = ['DELETE FROM "' + options.tableName + '"'];
  var values = [];
  var result = processWhere(options.where, query, values);

  query = result.query;
  values = result.values;

  query = query.join(' ').trim();

  return [query, values];
};

exports.dropTable = function dropTable (options) {
  return 'DROP TABLE "' + options.tableName + '";';
};
