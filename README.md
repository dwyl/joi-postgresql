# joi-postgresql
A little experiment in defining models in Joi and creating PostgreSQL Tables

[![Build Status](https://travis-ci.org/dwyl/joi-postgresql.svg?branch=master)](https://travis-ci.org/dwyl/joi-postgresql)
[![codecov](https://codecov.io/gh/dwyl/joi-postgresql/branch/master/graph/badge.svg)](https://codecov.io/gh/dwyl/joi-postgresql)
[![Code Climate](https://codeclimate.com/github/dwyl/joi-postgresql/badges/gpa.svg)](https://codeclimate.com/github/dwyl/joi-postgresql)
[![dependencies Status](https://david-dm.org/dwyl/joi-postgresql/status.svg)](https://david-dm.org/dwyl/joi-postgresql)
[![devDependencies Status](https://david-dm.org/dwyl/joi-postgresql/dev-status.svg)](https://david-dm.org/dwyl/joi-postgresql?type=dev)
[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/dwyl/joi-postgresql/issues)

## abase-db

### What?
abase-db is a [hapi](https://github.com/hapijs/hapi) plugin that provides an easy way to set up postgres database tables and perform CRUD operations by declaring a schema object which is heavily influenced by [joi](https://github.com/hapijs/joi).

It can be used alone but is most powerful when used as part of [abase](https://github.com/dwyl/abase) or with your select few abase plugins.

Note if you are totally new to Hapi.js see: https://github.com/dwyl/learn-hapi
And/or if you are new to postgres check out: https://github.com/dwyl/learn-postgresql

### Why?

From a joi schema we should be able to infer many things about the fields in a database. `abase-db` provides the mapping between a config (inspired by joi schema) to commands that can create tables with the correct fields.

We also want a "plug and play" access and easy to use handlers to perform CRUD operations and `abase-db` offers this without having to worry about any postgres querying.

For more understanding of *why* see the parent module [abase]((https://github.com/dwyl/abase)) as this provides just the db part.

> #### Why PostgreSQL?

> While there is a lot of hype surrounding NoSQL Databases like MongoDB & Redis, we found we were having to write a lot of code to do useful queries. And while de-normalising data might "make sense" for "scalability" in theory, what we found in practice is that even with 100 Billion Records (way more users than 99.99% of companies/startups!) a well-managed PostgreSQL cluster copes very well.

> Make up your own mind: https://www.postgresql.org/about
If you're still Curious or Worried about scaling PostgreSQL? see: https://www.citusdata.com Want to model the network of people as a graph? https://github.com/cayleygraph/cayley

### How?

1. Install `npm install abase-db --save`
2. Write a schema for your tables like so:
```js
  var schema = {
    tableName: 'users',
    fields: {
      name: { type: 'string' }
    }
  }
```
3. Run a database remotely or locally (see [here](https://github.com/dwyl/learn-postgresql) for how) and acquire db url or connection object.
4. Create options object of the form:
```js
  var options = {
    dbConnection: process.env.DATABASE_URL,
    schema: dbSchema
  };
```
5. Plugin
```js
server.register([
    { register: require('abase-db'), options: options }
], function () {
    server.route(routes);
    server.start();
});
```
6. Play
```js
handler: function (request, reply) {
    return request.abase.db.insert(
      { tableName: 'users', fields: request.payload },
      function () { return reply('OK') }
    );
}
```
7. Play without hapi. See API section below.

### API

#### Plugin: `require('abase-db')`

##### Registration
When registered with Hapi takes options of the form:
```
  { dbConnection, schema }
```
###### dbConnection
Either provide a database url and we'll do the rest or an object that can used to configure a pooled connection with [node-pg](https://github.com/brianc/node-postgres#client-pooling).
###### Schema

The schema is in align with the requirements made by [abase]((https://github.com/dwyl/abase)) and as stated before is inspired by joi and will try to provide a one to one mapping.

The schema must be an object (or an array of objects for multiple tables) of the form: `{ tableName, fields }`.

`fields` is of the form `{ [fieldName]: { type, rest: optional }`

Table and field names must be valid postgres table and column names. (non empty, alphanumeric, no leading number, less than 64)

Each field must be given a type prop. Data/joi types we support:

| Joi type (type prop for field)| Postgres type | Notes |
|---|---|---|
| `date` |  `DATE` or `TIMESTAMP` |  set `timestamp: true` for latter |
| `number` | `DOUBLE PRECISION` or `BIGINT` | set `integer: true` for latter |
| `string` | `VARCHAR(80 or max)` | `80` default, set `max: 123` as you like for more/less |
|boolean | BOOLEAN | |
| `id`  | VARCHAR(36) | **warning** if using this type do not add this field to your insert, we will generate an id on each insertion (Generated with [aguid](https://github.com/dwyl/aguid)) |

More information can be inferred from `lib/config_validator.js`

Each field can also take more properties most of which will be used by other abase modules and have no effect but the ones we care about right now are.

| Property | Notes |
|---|---|
| `unique` | set to `true` if you want column unique |
| `primaryKey` | set to `true` if you want this field to act as your primary key (note only one field allowed!) |
| `max`, `timestamp`, `integer` | see types table above for relevance |

##### Under the hood

###### Table Set Up
With given database and schema, on initialisation of plugin, we will create all necessary tables if they don't already exist.

This will only therefore happen if starting server for the first time, or if a new table is added to the schema.

**Unfortunately** if you want to modify a tables schema you will have to drop the whole table to have the database reconfigured on start up. We look to find a nice process for this in the future if you want to update your tables with new columns.

###### Request decoration

####### Handlers

Each request will have the db handlers `insert`, `select`, `update`, `delete`, `query`. They all have clients attached and ready to go.

They can be accessed like so: `request.abase.db.insert`.

They are all of the form `function(options, callback = optional)` and return promises if no callback given.

The `options` object must contain `tableName` for crud operation *if performing innerJoin not necessary*, i.e. the table you want to operate on. Below are more details for properties of options.

| Property | Used in | Notes |
| --- | --- | --- |
| `fields` | `insert`, `update` | Object with field names and values corresponding to the schema provided |  
| `select` | `select` | array of keys which want to be retrieved, if not present defaults to all columns, *note you can use `'name AS user_name'` to help with clashing column names in case of innerJoin*  |
| `where` | `select`, `update`, `delete` | object with field names and values that must match by equality (would like inequalities in future) |
| `or` | `where` | object with multiple field names and/or values where at least one must match by equality. An array can be provided to specify multiple options for one field |
| `innerJoin` or `leftOuterJoin` | `select` | Allows you to perform an joins of given type on two tables based on two fields. pass an object of the form `{ table1, table2, column1, column2 }`   |

The `query` handler takes options object of the form `{raw: 'SELECT * FROM your_raw_psql' }`.

####### Pool

You can also get the pool that the client uses by `db.pool`. You will be responsible for connecting and releasing clients. See details from [pg](https://github.com/brianc/node-pg-pool).

###### Server decoration

The hapi server will be given a method `endAbaseDb` of the form `function (callback)` which can be called to closed the pool connection.

##### use

#### validate: `require('abase-db').validate`

Helper that you can use to check your schema outside of hapi. Takes in a schema object and will throw if it fails.

#### createConnection: `require('abase').createConnection`

Helper of the form `function(dbConnection)` to create a single node-pg client that is configured in the same way as how you provide your dbConnection above.

#### handlers: `require('abase').handlers`

Object with methods `insert`, `select`, `update`, `delete`, `init`, `flush`.

They all have form `function(client, schema, options, cb)` so you will have to bind your own client.

Crud operation documented above.

##### init
Used at plugin registration takes same schema and doesn't use options arg.

##### flush
Used to drop tables easily. If given options arg will delete on a table by table basis but if left out will delete all tables in schema.
options takes the form `{tableName}`.

### Examples and tests

#### setup

For examples and tests you will need a `config.env` file at the root of your project with a test database url like so:
```
TEST_DATABASE_URL=psql://localhost:5432/testdb
```

Note: this database must be running and before tests are run the tables may be removed from the database so don't keep anything important there.

#### Simple example

To see a simple example in action type `npm run example` into your command line.

### Questions and Suggestions

We hope you find this module useful!

If you need something cleared up, have any requests or want to offer any improvements then please create an issue or better yet a PR!

Note We are aware that not all postgres features may be supported yet. This module will need a few iterations so please suggest missing features to be implemented as you use it and we can hopefully work together to solve it.
