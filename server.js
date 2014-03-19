var api = require('./api')
var fs = require('fs')
var hash = require('./lib/hash')
var http = require('http')
var hyperglue = require('hyperglue')
var st = require('st')
var url = require('url')

// Timestamp logs
require('logstamp')(function () {
  return new Date().toISOString() + ' [admin.wavefarm.org] ';
});

var port = process.argv[2] || process.env.PORT || 1040

var decorate = function (req, res) {
  res.notFound = function () {
    console.warn('Warning: Not Found');
    res.statusCode = 404;
    return res.end('Not Found');
  }
  res.error = function (err) {
    console.error(err.stack)
    res.statusCode = 500
    return res.end('Server Error')
  }
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
      if (err) return res.error(err)
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
}

var getSchemas = function (req, res, next) {
  api.schemas(function (err, apiRes, schemas) {
    if (err) return next(err)
    req.schemas = schemas
    next()
  })
}

var mount = st({cache: false, path: 'static'})

var itemRe = /^\/(\w{6})$/

http.createServer(function (req, res) {
  console.log(req.method, req.url)
  decorate(req, res)

  req.parsedUrl = url.parse(req.url);
  p = req.parsedUrl.pathname;

  // Index
  if (p == '/') return require('./routes')(req, res)

  // Item
  if (itemRe.test(p)) {
    req.itemId = itemRe.exec(p)[1]
    return require('./routes/item')(req, res)
  }

  mount(req, res)
}).listen(port, function () {
  console.log('Listening on port', port)
})
