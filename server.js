/* global EventSource */
var fs = require('fs')
var http = require('http')
var https = require('https')
var inject = require('script-injector')
var mime = require('mime')
var proxy = require('http-proxy').createProxyServer()
var url = require('url')

function reload () {
  (new EventSource('/_reload')).onmessage = function (e) {
    window.location.reload(true)
  }
}

var apiurl = url.parse(process.env.APIURL || 'https://wavefarm.org/api/')

http.createServer(function (req, res) {
  console.log(req.method, req.url)

  var path = url.parse(req.url).pathname

  if (path.indexOf('/api/') === 0) {
    req.url = req.url.replace('/api', '')
    return proxy.web(req, res, {
      target: apiurl,
      agent: https.globalAgent,
      headers: {host: apiurl.hostname}
    })
  }

  // Serve everything else from /admin/
  if (path.indexOf('/admin/') !== 0) {
    console.warn(404)
    res.statusCode = 404
    return res.end('Not Found')
  }
  path = path.replace('/admin', '')

  res.setHeader('Content-Type', mime.lookup(path) + '; charset=utf-8')
  var fileStream = fs.createReadStream('static' + path)
  fileStream.pipe(res)

  // If we can't create a stream (because file doesn't exist) send the index
  fileStream.on('error', function () {
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    return fs.createReadStream('static/index.html').pipe(inject(reload)).pipe(res)
  })
}).listen(process.env.PORT || 1040, function () {
  if (process.send) process.send('online')
})
