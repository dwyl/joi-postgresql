'use strict';

exports.values = function (obj, keys) {
  return (keys || Object.keys(obj))
    .map(function (k) { return obj[k] });
};

function nestedValues (obj) {
  return Object.keys(obj).map(function (k) {
    if (typeof obj[k] === 'object') {
      if (Array.isArray(obj[k])) {
        return obj[k];
      };
      return nestedValues(obj[k]);
    }
    return obj[k];
  }).reduce(function (a, b) {
    return a.concat(b);
  }, []);
}

exports.nestedValues = nestedValues;

function except (fields, obj) {
  var o = {};

  Object.keys(obj).forEach(function (k) {
    if (fields.indexOf(k) === -1) {
      o[k] = obj[k];
    }
  });

  return o;
}

exports.except = except;

exports.shallowCopy = function (obj) {
  return except([], obj);
};
