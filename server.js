var es = require('es');
var http = require('http');
var querystring = require('querystring');
var snout = require('snout');
var sys = require('sys');
var url = require('url');
var util = require('util');
var whiskers = require('whiskers');

var app = snout.app(__dirname);
app.name = 'free103';

es.DEBUG = true;

var getSettings = function() {
  var settings = { 
    mappings: {},
    settings: {
      analysis: {
        analyzer: {
          sort: {
            type: "custom",
            tokenizer: "keyword",
            filter: "lowercase"
          }
        }
      }
    }
  };
  for (model in app.models) {
    if (model.indexOf('.') == -1) {
      console.log(model);
      var fields = JSON.parse(app.models[model]).fields;
      settings.mappings[model] = {
        properties: {}
      };
      for (var i=0, l=fields.length, field; i<l; i++) {
        field = fields[i];
        if (field.sort) {
          var sortField = {
            type: 'multi_field',
            fields: {
              sort: {type: 'string', analyzer: 'sort'}
            }
          };
          sortField.fields[field.name] = {type: 'string'};
          settings.mappings[model].properties[field.name] = sortField;
        }
      }
    }
  }
  return settings;
};
  
app.route('/', function(req, res) {
  // PUT creates index "A" with alias at index
  if (req.method == 'PUT') {
    // create index "A"
    es.request({
      path: '/'+app.name+'a',
      method: 'PUT',
      data: JSON.stringify(getSettings()),
      res: res,
    }, function() {
      // create alias
      es.request({
        path: '/_aliases',
        method: 'POST',
        data: JSON.stringify({
          actions: [
            {add: {index: app.name+'a', alias: app.name}}
          ]
        }),
        res: res,
        respond: true,
      });
    });
    return;
  }
  // DELETE deletes alias and whichever index it points at
  if (req.method == 'DELETE') {
    es.request({
      path: '/'+app.name,
      method: 'DELETE',
      res: res,
      respond: true,
    });
    return;
  }
  var context = {};
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end(whiskers.render(app.templates.base, context));
});

app.route('/_app', function(req, res) {
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.end(JSON.stringify(app));
});

app.route('/_bulk', function(req, res) {
  var data = '', query = url.parse(req.url, true).query;
  req.on('data', function(chunk) {data += chunk;});
  req.on('end', function() {
    console.log(query);
    if (query.clean) {
      // TODO switch to new es api if it gets extended
      // check aliases for which index to create
      es.request({
        path: '/'+app.name+'a',
        method: 'HEAD'
      }, function(err) {
        var index, oldIndex;
        if (err) { // app.name+'a' doesn't exist
          index = app.name+'a';
          oldIndex = app.name+'b';
        } else {
          index = app.name+'b';
          oldIndex = app.name+'a';
        }
        // create alternative index
        es.request({
          path: '/'+index,
          method: 'PUT',
          data: JSON.stringify(getSettings()),
          res: res,
        }, function() {
          // switch alias
          es.request({
            path: '/_aliases',
            method: 'POST',
            data: JSON.stringify({
              actions: [
                {remove: {index: oldIndex, alias: app.name}},
                {add: {index: index, alias: app.name}}
              ]
            }),
            res: res,
          }, function() {
            // load bulk
            es.request({
              path: '/_bulk',
              method: 'POST',
              data: data,
              res: res
            }, function() {
              // delete old index
              es.request({
                path: '/'+oldIndex,
                method: 'DELETE',
                res: res,
                respond: true,
              });
            });
          });
        });
      });
      return;
    }
    es.request({
      path: '/_bulk',
      method: 'POST',
      data: data,
      res: res,
      respond: true,
    });
  });
});

app.route('/_get', function(req, res) {
  var query = url.parse(req.url, true).query;
  if (query) {
    var options = {
      path: '/'+app.name+'/_all/'+query.id,
      debug: true
    };
    es.request(options, function(err, data) {
      if (err) {
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end('404');
      } else {
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(JSON.stringify(JSON.parse(data)._source));
      }
    });
  }
});

app.route('/_index', function(req, res) {
  var data, options, query = url.parse(req.url, true).query;
  res.on('data', function(chunk) {data += chunk;});
  res.on('end', function() {
    var params = JSON.parse(data);
    if (params.create) {
      var indexName = params.create;
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
      options = {
        path: '/' + indexName,
        method: 'PUT',
        data: settings,
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
    } else if (params.reindex) {
      // reindex by switching alias back and forth
      // between a and b index
      // check aliases for current active index
      options = {
        path: '/_aliases',
        debug: true
      };
      es.request(options, function(err, result) {
        var source, dest;
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
                {remove: {index: source, alias: app.name}},
                {add: {index: dest, alias: app.name}}
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
  });
});

app.route('/_search', function(req, res) {
  var data = '';
  req.on('data', function(chunk) {
    data += chunk;
  });
  req.on('end', function() {
    var options = {
      path: '/'+app.name+'/_search',//?pretty=true', 
      method: 'POST',
      data: data,
      debug: true
    };
    es.request(options, function(err, data) {
      if (err) {
        res.writeHead(500, {'Content-Type': 'text/plain'});
        res.end('500');
      } else {
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end(data);
      }
    });
  });
});

app.listen(8126);
