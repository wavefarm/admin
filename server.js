var fs = require('fs')
var http = require('http')
var rut = require('rut')
var send = require('send')
var stack = require('stack')

var port = process.argv[2] || process.env.PORT || 1039

http.createServer(stack(
  // TODO basic auth for now with hedge
  function (req, res, next) {
    // prep data and html for routes
    res.data = {}
    res.html = {}
    next()
  },
  rut.get('/', require('./routes/index')),
  rut.get('/**', function (req, res, next, pathname) {
    send(req, pathname).from('static').pipe(res)
  })
)).listen(port, function () {
  console.log('Listening on port '+port)
})
