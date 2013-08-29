var ecstatic = require('ecstatic')
var hash = require('./lib/hash')
var http = require('http')
var hyperglue = require('hyperglue')
var rut = require('rut')
var snout = require('snout')
var stack = require('stack')

// Timestamp logs
require('logstamp')

var port = process.argv[2] || process.env.PORT || 1040

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

var resGlue = function (req, res, next) {
  res.glue = function (template, data) {
    return hyperglue(res.templates[template], data).innerHTML
  }
  next()
}

var resRender = function (req, res, next) {
  res.render = function (data) {
    res.send(res.glue('layout.html', data))
  }
  next()
}

http.createServer(stack(
  reqLog,
  ecstatic({root: __dirname + '/static', handleError: false}),
  resSend,
  resTemplates,
  resGlue,
  resRender,
  rut.get('/', require('./routes')),
  rut.get(/^\/(\w{6})$/, require('./routes/itemGet')),
  rut.post(/^\/(\w{6})$/, require('./routes/itemPost'))
)).listen(port, function () {
  console.log('Listening on port', port)
})
