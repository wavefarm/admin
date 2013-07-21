// TODO turn this into an api client library
var request = require('request')
var settings = require('./settings')

exports.req = function (path, cb) {
  console.log(settings.apiUrl+path)
  request({
    json: true,
    url: settings.apiUrl + path 
  }, function (err, res, body) {
    if (err) return cb(err)
    cb(null, body)
  })
}

exports.search = function (query, cb) {
  var searchString = query ? '?q='+encodeURIComponent(query) : ''
  exports.req('/search'+searchString, cb)
}
