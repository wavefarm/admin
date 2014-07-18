var api = require('./api')
var fs = require('fs')
var hash = require('./lib/hash')
var http = require('http')
var hyperglue = require('hyperglue')
var send = require('send')
var url = require('url')
var zlib = require('zlib')


var port = process.argv[2] || process.env.PORT || 1040

function decorate (req, res) {
  res.lost = function () {
    console.warn('Warning: Not Found');
    return require('./routes/404')(req, res)
  }
  res.error = function (err) {
    console.error(err.stack)
    return require('./routes/500')(req, res)
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
  res.layout = function () {
    res.statusCode = 200
    res.setHeader('content-type', 'text/html')
    res.setHeader('content-encoding', 'gzip')
    return fs.createReadStream('templates/layout.html').pipe(zlib.Gzip()).pipe(res)
  }
}

var itemRe = /^\/(\w{6})$/

http.createServer(function (req, res) {
  console.log(req.method, req.url)

  send(req, req.url).root('static').on('error', function (err) {
    decorate(req, res)

    if (err.status != 404) {
      console.error(err.stack)
      return res.error(err)
    }

    req.parsedUrl = url.parse(req.url);
    var p = req.parsedUrl.pathname;

    // Local proxy for api.wavefarm.org
    if (p.indexOf('/api') == 0) return require('./routes/api')(req, res);

    // Serve the index for items, to be filled in by the client
    if (itemRe.test(p)) {
      req.itemId = itemRe.exec(p)[1]
      return require('./routes/item')(req, res)
    }

    res.lost()
  }).pipe(res)
}).listen(port, function () {
  console.log('Listening on port', port)
  if (process.send) process.send('online')
})
