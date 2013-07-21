var hash = require('./lib/hash')
var http = require('http')
var rut = require('rut')
var send = require('send')
var stack = require('stack')

// Timestamp all output
require('log-timestamp')

var port = process.argv[2] || process.env.PORT || 1039

var resSend = function (req, res, next) {
  res.send = function (out) {
    var etag = hash(out)
    if (req.headers['if-none-match'] === etag) {
      res.writeHead(304)
      return res.end()
    }
    res.writeHead(200, {'Content-Type': 'text/html', 'ETag': etag})
    res.end(out)
  }
  next()
}

http.createServer(stack(
  resSend,
  rut.get('/', require('./routes')),
  rut.get('/**', function (req, res, next, pathname) {
    var sender = send(req, pathname).from('static')
    if (process.env.ENV === 'prod') sender.maxage(60000)
    sender.pipe(res)
  })
)).listen(port, function () {
  console.log('Listening on port', port)
})
