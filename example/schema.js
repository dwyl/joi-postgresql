'use strict';

module.exports = {
  tableName: 'posts',
  fields: {
    title: { type: 'string' },
    body: { type: 'string' },
    id: { type: 'number', integer: true }
  }
};
