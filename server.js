var hash = require('./lib/hash')
var http = require('http')
var hyperglue = require('hyperglue')
var rut = require('rut')
var send = require('send')
var snout = require('snout')
var stack = require('stack')

// Timestamp all output
require('log-timestamp')

var port = process.argv[2] || process.env.PORT || 1039

stack.errorHandler = function (req, res, err) {
  //console.error('Error:', err.message)
  console.error(err.stack)
  res.writeHead(500)
  res.end('{"message": "Internal server error"}\n')
}

stack.notFoundHandler = function (req, res) {
  console.warn('Warning: Not Found')
  res.writeHead(404)
  res.end('{"message": "not found"}\n')
}

var reqLog = function (req, res, next) {
  console.log(req.method, req.url)
  next()
}

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

var templates = snout(__dirname + '/static/templates')
var resTemplates = function (req, res, next) {
  res.templates = templates
  next()
}

var resRender = function (req, res, next) {
  res.render = function (template, data) {
    var out = hyperglue(res.templates[template], data).innerHTML
    res.send(out)
  }
  next()
}

http.createServer(stack(
  reqLog,
  resSend,
  resTemplates,
  resRender,
  rut.get('/', require('./routes')),
  rut.get(/^\/(\w{6})$/, require('./routes/item')),
  rut.get('/**', function (req, res, next, pathname) {
    var sender = send(req, pathname).from('static')
    if (process.env.ENV === 'prod') sender.maxage(60000)
    sender.pipe(res)
  })
)).listen(port, function () {
  console.log('Listening on port', port)
})
