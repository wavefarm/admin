// TODO turn this into an api client library
var request = require('request')
var settings = require('./settings')

exports.req = function (path, options, cb) {
  if (!cb) {
    cb = options
    options = {}
  }
  var defaults = {
    json: true,
    url: settings.apiUrl + path 
  }
  request(merge(defaults, options), function (err, res, body) {
    if (err) return cb(err)
    if (res.statusCode == 500) return cb(new Error('[API] ' + body.message))
    cb(null, res, body)
  })
}

exports.search = function (query, cb) {
  var searchString = query ? '?q='+encodeURIComponent(query) : ''
  exports.req('/search'+searchString, cb)
}

exports.get = function (id, cb) {
  exports.req('/'+id, cb)
}

exports.put = function (id, item, cb) {
  exports.req('/'+id, {
    method: 'put',
    json: item
  }, cb)
}

exports.schemas = function (cb) {
  exports.req('/schemas', cb)
}

function merge (a, b) {
  for (var k in b) {
    a[k] = b[k]
  }
  return a
}
