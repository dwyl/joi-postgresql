'use strict';

var mapObj = {
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
  }
};

function mapper (name, type, options) {
  var opts = options || {};
  var constraints = '';

  if (opts.unique) {
    constraints += ' CONSTRAINT ' + name + '_unique UNIQUE';
  }

  return name + ' ' + mapObj[type](opts) + constraints;
}

module.exports = mapper;
module.exports.mapObj = mapObj;
