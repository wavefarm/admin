var http = require('http');
var settings = require('../settings')
var url = require('url');


var u = url.parse(settings.apiUrl);

module.exports = function (req, res) {
  var clientReq = http.request({
    hostname: u.hostname,
    port: u.port,
    auth: u.auth,
    path: req.parsedUrl.path.replace(/^\/api/, ''),
    method: req.method, 
    headers: req.headers
  }, function (clientRes) {
    res.writeHead(clientRes.statusCode, clientRes.headers)
    clientRes.pipe(res)
  })
  clientReq.on('error', function (err) {
    console.error('Error: Cannot connect to ' + u.href)
    res.writeHead(502)
    res.end('Bad Gateway')
  })
  req.pipe(clientReq)
};
