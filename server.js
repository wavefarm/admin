var fs = require('fs')
var http = require('http')
var rut = require('rut')
var send = require('send')
var stack = require('stack')

var port = process.argv[2] || process.env.PORT || 1039

http.createServer(stack(
  rut.get('/', function (req, res, next) {
    fs.readFile('static/templates/base.html', function (err, data) {
      if (err) next(err)
      res.writeHead(200, {'Content-Type': 'text/html'})
      res.end(data)
    })
  }),
  rut.get('/**', function (req, res, next, pathname) {
    send(req, pathname).from('static').pipe(res)
  })
)).listen(port, function () {
  console.log('Listening on port '+port)
})
