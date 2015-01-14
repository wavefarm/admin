var fs = require('fs')
var http = require('http')
var mime = require('mime')
var url = require('url')


http.createServer(function (req, res) {
  console.log(req.method, req.url)

  var path = url.parse(req.url).pathname
  var mimetype = mime.lookup(path)

  // Assume paths without extension will be handled by index
  if (mimetype == 'application/octet-stream') {
    mimetype = 'text/html'
    path = '/index.html'
  }

  var file = 'static' + path
  if (!fs.existsSync(file)) {
    console.warn(404)
    res.statusCode = 404
    return res.end('Not Found')
  }

  res.setHeader('Content-Type', mimetype + '; charset=utf-8')
  fs.createReadStream(file).pipe(res)
}).listen(process.env.PORT || 1040, function () {
  if (process.send) process.send('online')
})
