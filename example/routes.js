'use strict';

var newPost = '<form action="/new" method="POST" >'
  + '<input name = "title" >'
  + '<input name = "body" >'
  + '<input type="submit" value="Create" />'
  + '</form>'
;

function existingPost (post) {
  var id = post.id;
  var title = post.title;
  var body = post.body;

  return '<div><form action="/update/ ' + id + '" method="POST" >'
    + '<input name = "title" value = "' + title + '">'
    + '<input name = "body" value = "' + body + '">'
    + '<input type="submit" value="Update" />'
    + '</form>'
    + '<form action="/delete/' + id + '" method="GET" >'
    + '<input type="submit" value="Delete" />'
    + '</form></div>'
  ;
}

module.exports = [{
  method: 'GET',
  path: '/',
  handler: function (request, reply) {
    return request.abase.db.select({ tableName: 'posts' }, function (_, data) {
      var sortedRows = data.rows.sort(function (a, b) {
        return a.id > b.id;
      });

      return reply(newPost + sortedRows.map(existingPost).join('<br/>'));
    });
  }
}, {
  method: 'POST',
  path: '/new',
  handler: function (request, reply) {
    var id = Date.now();
    var fields = Object.assign({ id: id }, request.payload);

    return request.abase.db.insert(
      { tableName: 'posts', fields: fields },
      function () { return reply.redirect('/') }
    );
  }
}, {
  method: 'GET',
  path: '/delete/{id}',
  handler: function (request, reply) {
    var id = request.params.id;

    return request.abase.db.delete(
      { tableName: 'posts', where: { id: id } },
      function () { return reply.redirect('/') }
    );
  }
}, {
  method: 'POST',
  path: '/update/{id}',
  handler: function (request, reply) {
    var id = request.params.id;

    return request.abase.db.update(
      { tableName: 'posts', where: { id: id }, fields: request.payload },
      function () { return reply.redirect('/') }
    );
  }
}];
