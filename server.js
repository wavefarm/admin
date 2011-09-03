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
  res.end(whiskers.render(app.templates['base.html'], context));//, partials));
});

app.route('/data-check', function(req, res) {
  res.writeHead(200, {'Content-Type': 'application/json'});
  var message = {};
  var repoOptions = {
    host: 'data.free103point9.org',
    port: 80,
    path: '/log'
  };
  var repoLog = '';
  var repoReq = http.get(repoOptions, function(repoRes) {
    repoRes.on('data', function(chunk) {
      repoLog += chunk;
    });
    repoRes.on('end', function() {
      if (repoRes.statusCode == 200) {
        message['log retrieved'] = true;
      }
      console.log('repo log: ' + repoLog);
      res.end(JSON.stringify(message));
    });
  });
  //var esOptions = {
  //  host: '127.0.0.1',
  //  port: 9200,
  //  path: '/ta/artist/_search',
  //  method: 'POST'
  //};
  //var data = '';
  //var esReq = http.request(esOptions, function(esRes) {
  //  esRes.on('data', function(chunk) {
  //    console.log('body: ' + chunk);
  //    data += chunk;
  //  });
  //  esRes.on('end', function() {
  //    var result = JSON.parse(data);
  //    context['artists'] = [];
  //    for (var i=0, l=result.hits.total, artist; i<l; i++) {
  //      artist = result.hits.hits[i].fields;
  //      context['artists'].push(artist);
  //    }
  //    res.writeHead(200, {'Content-Type': 'text/html'});
  //    res.end(whiskers.render(app.templates['base.html'], context, partials));
  //  });
  //});
  //esReq.on('error', function(e) {
  //  console.log("Got error: " + e.message);
  //});
});

exports.start = function(port) {
  app.listen(port);
};
