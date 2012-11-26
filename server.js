var fs = require('fs')
var hash = require('./lib/hash')
var http = require('http')
var rut = require('rut')
var send = require('send')
var stack = require('stack')

var port = process.argv[2] || process.env.PORT || 1039

http.createServer(stack(
  // TODO basic auth for now with hedge
  function (req, res, next) {
    res.send = function (out) {
      var etag = hash(out)
      if (req.headers['if-none-match'] === etag) {
        res.statusCode = 304
        return res.end()
      }
      res.writeHead(200, {'Content-Type': 'text/html', 'ETag': etag})
      res.end(out)
    }
    next()
  },
  rut.get('/', require('./routes/index')),
  rut.get('/**', function (req, res, next, pathname) {
    send(req, pathname).from('static').pipe(res)
  })
)).listen(port, function () {
  console.log('Listening on port '+port)
})
