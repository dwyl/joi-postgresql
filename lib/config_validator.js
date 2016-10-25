'use strict';

var Joi = require('joi');

var mapObj = require('./create_table_map.js').mapObj;

// non empty, alphanumeric, no leading number, less than 64
var dbNameRegEx = /^[A-Za-z_]\w{0,62}$/;
var fieldTypes = Object.keys(mapObj);

var fieldSchema = Joi.object()
  .keys({ type: Joi.any().valid(fieldTypes) })
  .unknown()
;
var configSchema = Joi.object().keys({
  table_name: Joi.string().regex(dbNameRegEx).required(), // eslint-disable-line
  fields: Joi.object().pattern(dbNameRegEx, fieldSchema).required() // eslint-disable-line
});

module.exports = function (config) {
  return Joi.assert(config, configSchema);
};

module.exports.dbNameRegEx = dbNameRegEx;
