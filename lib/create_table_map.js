'use strict';

var mapObj = {
  id: function () {
    return 'VARCHAR(36)';
  },
  number: function (opts) {
    return opts.integer ? 'BIGINT' : 'DOUBLE PRECISION';
  },
  string: function (opts) {
    var length = opts.max || 80;

    return 'VARCHAR(' + length + ')';
  },
  boolean: function () {
    return 'BOOLEAN';
  },
  date: function (opts) {
    return opts.timestamp ? 'TIMESTAMP' : 'DATE';
  },
  time: function () {
    return 'TIMESTAMP'
  }
};

function mapper (name, type, options, tableName) {
  var opts = options || {};
  var constraints = '';

  if (opts.primaryKey) {
    constraints += ' CONSTRAINT ' + tableName + '_pk PRIMARY KEY';
  }
  if (opts.unique) {
    constraints += ' CONSTRAINT ' + tableName + '_' + name + '_unique UNIQUE';
  }

  return name + ' ' + mapObj[type](opts) + constraints;
}

module.exports = mapper;
module.exports.mapObj = mapObj;
