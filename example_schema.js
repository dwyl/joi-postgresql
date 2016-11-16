'use strict';

module.exports = {
  tableName: 'user_data',
  fields: {
    email: {
      type: 'string',
      email: true
    },
    username: {
      type: 'string',
      min: 3,
      max: 20,
      unique: true
    },
    dob: { type: 'date' },
    id: { type: 'id' }
  }
};
