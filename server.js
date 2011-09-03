var http = require('http');
var querystring = require('querystring');
var snout = require('snout');
var sys = require('sys');
var url = require('url');
var util = require('util');
var whiskers = require('whiskers');

var app = snout.app(__dirname+'/templates');

app.route('/', function(req, res) {
  var context = {};
  //var partials = {
  //  content: app.templates.index
  //};
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end(whiskers.render(app.templates.base, context));//, partials));
});

exports.start = function(port) {
  app.listen(port);
};
