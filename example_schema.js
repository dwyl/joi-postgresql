'use strict';

module.exports = {
  table_name: 'user_data', // eslint-disable-line
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
    dob: { type: 'date' }
  }
};
