// TODO turn this into an api client library
var request = require('request')
var settings = require('./settings')

exports.req = function (path, cb) {
  request({
    json: true,
    url: settings.apiUrl + path 
  }, function (err, res, body) {
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
