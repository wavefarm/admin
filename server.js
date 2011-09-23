var es = require('es');
var http = require('http');
var lazy = require('lazy');
var pairtree = require('pairtree');
var querystring = require('querystring');
var snout = require('snout');
var sys = require('sys');
var url = require('url');
var util = require('util');
var whiskers = require('whiskers');

var app = snout.app(__dirname);

app.route('/', function(req, res) {
  var context = {};
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end(whiskers.render(app.templates.base, context));
});

app.route('/_app', function(req, res) {
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.end(JSON.stringify(app));
});

app.route('/_get', function(req, res) {
  var query = url.parse(req.url, true).query;
  if (query) {
    var options = {
      path: '/free103/_all/'+query.id,
      debug: true
    };
    es.request(options, function(err, result) {
      if (err) {
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end('404');
      } else {
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(result._source));
      }
    });
  }
});

app.route('/_index', function(req, res) {
  var data, options, query = url.parse(req.url, true).query;
  if (query) {
    if (query.reindex) {
      // reindex by switching free103 alias back and forth
      // between free103a and free103b
      options = {
        path: '/_aliases',
        debug: true
      };
      es.request(options, function(err, result) {
        var source, dest;
        // TODO generate mappings from models
        var settings = { 
          "mappings": {
            "_default_": {
              "dynamic_templates": [
                {
                  "base": {
                    "match": "*_sort",
                    "mapping": {
                      "type": "multi_field", 
                      "fields": {
                        "{name}": {"type": "string"},
                        "sort": {"type": "string", "analyzer": "sort"}
                      }
                    }
                  }
                }
              ]
            }
          },
          "settings": {
            "analysis": {
              "analyzer": {
                "sort": {
                  "type": "custom",
                  "tokenizer": "keyword",
                  "filter": "lowercase"
                }
              }
            }
          }
        };
        if (result.free103a) {
          source = 'free103a';
          dest = 'free103b';
        } else {
          source = 'free103b';
          dest = 'free103a';
        }
        // create dest
        options = {
          path: '/' + dest,
          method: 'PUT',
          data: settings,
          debug: true
        };
        es.request(options, function(err, result) {
          // TODO scan source and add all documents to dest
          // point alias at dest
          options = {
            path: '/_aliases',
            method: 'POST',
            data: {
              actions: [
                {remove: {index: source, alias: 'free103'}},
                {add: {index: dest, alias: 'free103'}}
              ]
            },
            debug: true
          }
          es.request(options, function(err, result) {
            // now delete source
            options = {
              path: '/' + source,
              method: 'DELETE',
              debug: true
            };
            es.request(options, function(err, result) {
              res.writeHead(200, {'Content-Type': 'application/json'});
              res.end(JSON.stringify(result));
            });
          });
        });
      });
    }
  }
});

app.route('/_search', function(req, res) {
  var data = '';
  req.on('data', function(chunk) {
    data += chunk;
  });
  req.on('end', function() {
    var search = JSON.parse(data);
    // TODO use dismax for query
    var esSearch = {
      query: {
        query_string: {
          query: search.query
        }
      }
    };
    //console.log(esSearch);
    var options = {
      path: '/free103/_search',//?pretty=true', 
      method: 'POST',
      data: esSearch,
      debug: true
    };
    es.request(options, function(err, result) {
      if (err) {
        res.writeHead(500, {'Content-Type': 'text/plain'});
        res.end('500');
      } else {
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(result));
      }
    });
  });
});

var timestampRe = /^/gm;
app.route('/data-check', function(req, res) {
  res.writeHead(200, {'Content-Type': 'application/json'});
  // TODO: get all log files
  var repoOptions = {
    host: 'data.free103point9.org',
    port: 80,
    path: '/r/.logs/action.log'
  };
  var repoLog = '';
  var repoReq = http.get(repoOptions, function(repoRes) {
    if (repoRes.statusCode != 200) {
      res.end(JSON.stringify({'repo status': repoRes.statusCode, 'log retrieved': false}));
      return;
    }
    var action, timestamp, method, id, filename;
    lazy(repoRes).lines.forEach(function(line) {
      line = String(line);
      action = line.split(' ');
      timestamp = action.shift();
      method = action.shift();
      id = action.shift();
      filename = action.join(' ');
      console.log(filename);
      if (filename == 'meta.json') {
        if (method == 'POST') {
          console.log('Adding ' + id);
          // get meta.json
          var metaOptions = {
            host: 'data.free103point9.org',
            port: 80,
            path: '/r' + pairtree.path(id) + 'meta.json'
          };
          http.get(metaOptions, function(metaRes) {
            var meta = '';
            metaRes.on('data', function(chunk) {
              meta += chunk;
            });
            metaRes.on('end', function() {
              var doc = JSON.parse(meta);
              // add to index
              var esOptions = {
                host: '127.0.0.1',
                port: 9200,
                path: '/free103/' + doc.type + '/' + doc._id,
                method: 'PUT'
              };
              var esReq = http.request(esOptions, function(esRes) {
                var data = '';
                esRes.on('data', function(chunk) {
                  //console.log('body: ' + chunk);
                  data += chunk;
                });
                esRes.on('end', function() {
                  console.log(data);
                });
                esReq.on('error', function(e) {
                  console.log("ES error: " + e.message);
                });
              });
              esReq.end(meta);
            });
          });
        } else if (method == 'DELETE') {
          console.log('Dropping ' + id);
          // drop from index
        }
      }
    });
    //repoRes.on('data', function(chunk) {
    //  console.log('\n\nChunk:\n'+chunk);
    //  repoLog += chunk;
    //  // look in data received so far for last-checked timestamp
    //  if (repoLog.indexOf('2011-09-05T21:41:55.158363') != -1) {
    //    console.log('timestamp found');
    //  }
    //});
    repoRes.on('end', function() {
      //console.log('repo log: ' + repoLog);
      res.end(JSON.stringify({'log retrieved': true}));
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
