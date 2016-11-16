'use strict';

exports.values = function (obj, keys) {
  return (keys || Object.keys(obj))
    .map(function (k) { return obj[k] });
};


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
