var ecstatic = require('ecstatic')
var fs = require('fs')
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

var resRender = function (req, res, next) {
  res.send = function (out) {
    var etag = hash(out)
    if (req.headers['if-none-match'] === etag) {
      res.writeHead(304)
      return res.end()
    }
    res.writeHead(200, {'Content-Type': 'text/html', 'ETag': etag})
    res.end(out)
  }
  res.glue = function (template, data, cb) {
    fs.readFile(__dirname + '/templates/' + template, {encoding: 'utf8'}, function (err, tmplt) {
      if (err) return next(err)
      cb(hyperglue(tmplt, data).innerHTML)
    })
  }
  res.render = function (template, data) {
    res.glue(template, data, function (inner) {
      data['#main'] = {_html: inner}
      res.glue('layout.html', data, function (out) {
        res.send(out)
      })
    })
  }
  next()
}

http.createServer(stack(
  reqLog,
  ecstatic({root: __dirname + '/static', handleError: false}),
  resRender,
  rut.get('/', require('./routes')),
  rut.get(/^\/(\w{6})$/, require('./routes/itemGet')),
  rut.post(/^\/(\w{6})$/, require('./routes/itemPost'))
)).listen(port, function () {
  console.log('Listening on port', port)
})
