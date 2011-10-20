var app = require('./app');
var http = require('http');

var port = process.argv[2] || 8126;

http.createServer(function(req, res) {
  app.respond(req, res);
}).listen(port);

console.log('Running on port '+port);
